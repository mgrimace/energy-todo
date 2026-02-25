use actix_web::{web, HttpResponse, Responder};
use crate::errors::AppError;
use crate::models::{Energy, NewTodo, ReorderTodos, Todo, UpdateTodo};
use crate::state::AppState;
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::oneshot;
use tracing::error;

fn now_unix_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

async fn persist_snapshot(state: &AppState, snapshot: Vec<Todo>) -> Result<Vec<Todo>, AppError> {
    let (respond_to, response_rx) = oneshot::channel();

    if let Err(e) = state
        .persist_tx
        .send(crate::state::PersistRequest { snapshot, respond_to })
        .await
    {
        error!(error = %e, "failed to queue persistence request");
        return Err(AppError::Persistence);
    }

    match response_rx.await {
        Ok(Ok(saved_snapshot)) => Ok(saved_snapshot),
        Ok(Err(e)) => {
            error!(error = %e, "failed to save todos");
            Err(AppError::Persistence)
        }
        Err(e) => {
            error!(error = %e, "persistence worker dropped response");
            Err(AppError::Persistence)
        }
    }
}

pub fn configure_api(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/todos")
            .route(web::get().to(get_todos))
            .route(web::post().to(create_todo)),
    )
    .service(web::resource("/todos/reorder").route(web::post().to(reorder_todos)))
    .service(
        web::resource("/todos/{id}")
            .route(web::patch().to(patch_todo))
            .route(web::delete().to(delete_todo)),
    );
    cfg.service(
        web::resource("/events").route(web::get().to(sse_events))
    );
}

async fn get_todos(state: web::Data<AppState>) -> impl Responder {
    let todos = state.todos.read().await.clone();
    HttpResponse::Ok().json(todos)
}

async fn create_todo(state: web::Data<AppState>, payload: web::Json<NewTodo>) -> Result<HttpResponse, AppError> {
    let _write_guard = state.write_lock.lock().await;

    let (snapshot, todo) = {
        let todos_lock = state.todos.read().await;

        let next_id = todos_lock.iter().map(|t| t.id).max().unwrap_or(0).saturating_add(1);
        let todo = Todo {
            id: next_id,
            title: payload.title.clone(),
            energy: payload.energy.clone(),
            tags: payload.tags.clone(),
            completed: false,
            completed_at: None,
        };

        let mut snapshot = todos_lock.clone();
        let insert_index = match todo.energy {
            Energy::High => snapshot.iter().filter(|todo| !todo.completed).count(),
            _ => 0,
        };
        snapshot.insert(insert_index, todo.clone());
        (snapshot, todo)
    };

    let snapshot = persist_snapshot(state.get_ref(), snapshot).await?;

    let mut todos_lock = state.todos.write().await;
    *todos_lock = snapshot;
    drop(todos_lock);

    // publish event
    let _ = state.broadcaster.send(json!({"type":"create","todo":todo}).to_string());
    Ok(HttpResponse::Created().json(todo))
}

async fn patch_todo(path: web::Path<u64>, state: web::Data<AppState>, payload: web::Json<UpdateTodo>) -> Result<HttpResponse, AppError> {
    let _write_guard = state.write_lock.lock().await;

    let id = path.into_inner();
    let (snapshot, updated) = {
        let todos_lock = state.todos.read().await;

        let mut snapshot = todos_lock.clone();
        if let Some(index) = snapshot.iter().position(|t| t.id == id) {
            let was_completed = snapshot[index].completed;
            if let Some(title) = &payload.title { snapshot[index].title = title.clone(); }
            if let Some(energy) = &payload.energy { snapshot[index].energy = energy.clone(); }
            if let Some(tags) = &payload.tags { snapshot[index].tags = tags.clone(); }
            if let Some(completed) = payload.completed {
                snapshot[index].completed = completed;
                snapshot[index].completed_at = if completed {
                    Some(now_unix_millis())
                } else {
                    None
                };
            }

            let mut updated = snapshot[index].clone();

            if payload.completed.is_some() && updated.completed != was_completed {
                let transitioned = snapshot.remove(index);
                if transitioned.completed {
                    let active_len = snapshot.iter().filter(|todo| !todo.completed).count();
                    snapshot.insert(active_len, transitioned.clone());
                } else {
                    snapshot.insert(0, transitioned.clone());
                }
                updated = transitioned;
            }

            (snapshot, updated)
        } else {
            return Err(AppError::NotFound);
        }
    };

    let snapshot = persist_snapshot(state.get_ref(), snapshot).await?;

    let mut todos_lock = state.todos.write().await;
    *todos_lock = snapshot;
    drop(todos_lock);

    // publish event
    let _ = state.broadcaster.send(json!({"type":"update","todo":updated}).to_string());
    Ok(HttpResponse::Ok().json(updated))
}

async fn reorder_todos(state: web::Data<AppState>, payload: web::Json<ReorderTodos>) -> Result<HttpResponse, AppError> {
    let _write_guard = state.write_lock.lock().await;

    let snapshot = {
        let todos_lock = state.todos.read().await;
        let current = todos_lock.clone();

        let active: Vec<Todo> = current
            .iter()
            .filter(|todo| !todo.completed)
            .cloned()
            .collect();
        let completed: Vec<Todo> = current
            .iter()
            .filter(|todo| todo.completed)
            .cloned()
            .collect();

        if payload.active_ids.len() != active.len() {
            return Err(AppError::BadRequest);
        }

        let active_id_set: std::collections::HashSet<u64> = active.iter().map(|todo| todo.id).collect();
        let payload_id_set: std::collections::HashSet<u64> = payload.active_ids.iter().copied().collect();

        if active_id_set != payload_id_set {
            return Err(AppError::BadRequest);
        }

        let mut active_map = std::collections::HashMap::new();
        for todo in active {
            active_map.insert(todo.id, todo);
        }

        let mut reordered = Vec::with_capacity(current.len());
        for id in &payload.active_ids {
            if let Some(todo) = active_map.remove(id) {
                reordered.push(todo);
            } else {
                return Err(AppError::BadRequest);
            }
        }

        reordered.extend(completed);
        reordered
    };

    let snapshot = persist_snapshot(state.get_ref(), snapshot).await?;

    let mut todos_lock = state.todos.write().await;
    *todos_lock = snapshot.clone();
    drop(todos_lock);

    let _ = state.broadcaster.send(json!({"type":"reorder","todos":snapshot.clone()}).to_string());
    Ok(HttpResponse::Ok().json(snapshot))
}

async fn delete_todo(path: web::Path<u64>, state: web::Data<AppState>) -> Result<HttpResponse, AppError> {
    let _write_guard = state.write_lock.lock().await;

    let id = path.into_inner();
    let snapshot = {
        let todos_lock = state.todos.read().await;

        let mut snapshot = todos_lock.clone();
        let before = snapshot.len();
        snapshot.retain(|t| t.id != id);
        if snapshot.len() == before {
            return Err(AppError::NotFound);
        }
        snapshot
    };

    let snapshot = persist_snapshot(state.get_ref(), snapshot).await?;

    let mut todos_lock = state.todos.write().await;
    *todos_lock = snapshot;
    drop(todos_lock);

    // publish event
    let _ = state.broadcaster.send(json!({"type":"delete","id":id}).to_string());
    Ok(HttpResponse::NoContent().finish())
}

use async_stream::stream;
use std::convert::Infallible;

async fn sse_events(state: web::Data<AppState>) -> HttpResponse {
    let mut rx = state.broadcaster.subscribe();

    let event_stream = stream! {
        loop {
            match rx.recv().await {
                Ok(msg) => {
                    let data = format!("data: {}\n\n", msg);
                    yield Ok::<_, Infallible>(web::Bytes::from(data));
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => continue,
                Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
            }
        }
    };

    HttpResponse::Ok()
        .append_header(("content-type", "text/event-stream"))
        .append_header(("cache-control", "no-cache, no-transform"))
        .append_header(("connection", "keep-alive"))
        .append_header(("x-accel-buffering", "no"))
        .append_header(("x-content-type-options", "nosniff"))
        .streaming(event_stream)
}
