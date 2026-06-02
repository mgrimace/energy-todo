use crate::db;
use crate::errors::AppError;
use crate::models::{NewTodo, ReorderTodos, UpdateTodo};
use crate::state::AppState;
use crate::state::ReplayBatch;
use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;
use serde_json::json;
use std::collections::HashSet;

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
    cfg.service(web::resource("/events").route(web::get().to(sse_events)));
}

async fn get_todos(state: web::Data<AppState>) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let todos = db::get_all_todos(&db).map_err(|e| {
        eprintln!("{}", e);
        AppError::Database
    })?;
    Ok(HttpResponse::Ok().json(todos))
}

async fn create_todo(
    state: web::Data<AppState>,
    payload: web::Json<NewTodo>,
) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let todo = db::create_todo(&db, &payload).map_err(|e| {
        eprintln!("{}", e);
        AppError::Database
    })?;
    drop(db);
    state
        .publish(json!({"type":"create","todo":todo}).to_string())
        .await;
    Ok(HttpResponse::Created().json(todo))
}

async fn patch_todo(
    path: web::Path<u64>,
    state: web::Data<AppState>,
    payload: web::Json<UpdateTodo>,
) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let updated = db::update_todo(&db, path.into_inner(), &payload)
        .map_err(|e| {
            eprintln!("{}", e);
            AppError::Database
        })?
        .ok_or(AppError::NotFound)?;
    drop(db);
    state
        .publish(json!({"type":"update","todo":updated}).to_string())
        .await;
    Ok(HttpResponse::Ok().json(updated))
}

async fn reorder_todos(
    state: web::Data<AppState>,
    payload: web::Json<ReorderTodos>,
) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;

    let current_ids = db::get_active_ids(&db).map_err(|e| {
        eprintln!("{}", e);
        AppError::Database
    })?;
    if payload.active_ids.len() != current_ids.len() {
        return Err(AppError::BadRequest);
    }
    let current_set: HashSet<u64> = current_ids.into_iter().collect();
    let payload_set: HashSet<u64> = payload.active_ids.iter().copied().collect();
    if current_set != payload_set {
        return Err(AppError::BadRequest);
    }

    db::reorder_active(&db, &payload.active_ids).map_err(|e| {
        eprintln!("{}", e);
        AppError::Database
    })?;
    let todos = db::get_all_todos(&db).map_err(|e| {
        eprintln!("{}", e);
        AppError::Database
    })?;
    drop(db);

    state
        .publish(json!({"type":"reorder","todos":todos}).to_string())
        .await;
    Ok(HttpResponse::Ok().json(todos))
}

async fn delete_todo(
    path: web::Path<u64>,
    state: web::Data<AppState>,
) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let id = path.into_inner();
    let found = db::delete_todo(&db, id).map_err(|e| {
        eprintln!("{}", e);
        AppError::Database
    })?;
    drop(db);
    if !found {
        return Err(AppError::NotFound);
    }
    state
        .publish(json!({"type":"delete","id":id}).to_string())
        .await;
    Ok(HttpResponse::NoContent().finish())
}

use async_stream::stream;
use std::convert::Infallible;
use std::time::Duration;

#[derive(Deserialize)]
struct SseQuery {
    last_event_id: Option<u64>,
}

fn parse_last_event_id(req: &HttpRequest, query: &web::Query<SseQuery>) -> u64 {
    query
        .last_event_id
        .or_else(|| {
            req.headers()
                .get("last-event-id")
                .and_then(|value| value.to_str().ok())
                .and_then(|value| value.parse::<u64>().ok())
        })
        .unwrap_or(0)
}

fn format_sse_message(id: u64, payload: &str) -> web::Bytes {
    web::Bytes::from(format!("id: {}\ndata: {}\n\n", id, payload))
}

fn format_sse_keepalive() -> web::Bytes {
    web::Bytes::from("event: keepalive\ndata: {}\n\n")
}

fn stream_replay_batch(batch: ReplayBatch, last_sent_id: &mut u64) -> Vec<web::Bytes> {
    let mut frames = Vec::new();

    if batch.reset_required {
        let reset_id = *last_sent_id + 1;
        frames.push(format_sse_message(reset_id, r#"{"type":"reset"}"#));
        *last_sent_id = reset_id;
    }

    for (id, payload) in batch.events {
        if id > *last_sent_id {
            frames.push(format_sse_message(id, &payload));
            *last_sent_id = id;
        }
    }

    frames
}

async fn sse_events(
    req: HttpRequest,
    query: web::Query<SseQuery>,
    state: web::Data<AppState>,
) -> HttpResponse {
    let requested_last_event_id = parse_last_event_id(&req, &query);
    let mut rx = state.broadcaster.subscribe();
    let replay_batch = state.replay_since(requested_last_event_id).await;
    let mut interval = tokio::time::interval(Duration::from_secs(25));

    let event_stream = stream! {
        let mut last_sent_id = requested_last_event_id;

        interval.tick().await;

        for frame in stream_replay_batch(replay_batch, &mut last_sent_id) {
            yield Ok::<_, Infallible>(frame);
        }

        loop {
            tokio::select! {
                _ = interval.tick() => {
                    yield Ok::<_, Infallible>(format_sse_keepalive());
                }
                msg = rx.recv() => match msg {
                    Ok((id, payload)) => {
                        if id <= last_sent_id {
                            continue;
                        }
                        last_sent_id = id;
                        yield Ok::<_, Infallible>(format_sse_message(id, &payload));
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => {
                        for frame in stream_replay_batch(state.replay_since(last_sent_id).await, &mut last_sent_id) {
                            yield Ok::<_, Infallible>(frame);
                        }
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                }
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
