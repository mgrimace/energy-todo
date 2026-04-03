use actix_web::{web, HttpResponse};
use crate::db;
use crate::errors::AppError;
use crate::models::{NewTodo, ReorderTodos, UpdateTodo};
use crate::state::AppState;
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
    cfg.service(
        web::resource("/events").route(web::get().to(sse_events))
    );
}

async fn get_todos(state: web::Data<AppState>) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let todos = db::get_all_todos(&db).map_err(|e| { eprintln!("{}", e); AppError::Database })?;
    Ok(HttpResponse::Ok().json(todos))
}

async fn create_todo(state: web::Data<AppState>, payload: web::Json<NewTodo>) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let todo = db::create_todo(&db, &payload).map_err(|e| { eprintln!("{}", e); AppError::Database })?;
    drop(db);
    let _ = state.broadcaster.send(json!({"type":"create","todo":todo}).to_string());
    Ok(HttpResponse::Created().json(todo))
}

async fn patch_todo(path: web::Path<u64>, state: web::Data<AppState>, payload: web::Json<UpdateTodo>) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let updated = db::update_todo(&db, path.into_inner(), &payload)
        .map_err(|e| { eprintln!("{}", e); AppError::Database })?
        .ok_or(AppError::NotFound)?;
    drop(db);
    let _ = state.broadcaster.send(json!({"type":"update","todo":updated}).to_string());
    Ok(HttpResponse::Ok().json(updated))
}

async fn reorder_todos(state: web::Data<AppState>, payload: web::Json<ReorderTodos>) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;

    let current_ids = db::get_active_ids(&db).map_err(|e| { eprintln!("{}", e); AppError::Database })?;
    if payload.active_ids.len() != current_ids.len() {
        return Err(AppError::BadRequest);
    }
    let current_set: HashSet<u64> = current_ids.into_iter().collect();
    let payload_set: HashSet<u64> = payload.active_ids.iter().copied().collect();
    if current_set != payload_set {
        return Err(AppError::BadRequest);
    }

    db::reorder_active(&db, &payload.active_ids).map_err(|e| { eprintln!("{}", e); AppError::Database })?;
    let todos = db::get_all_todos(&db).map_err(|e| { eprintln!("{}", e); AppError::Database })?;
    drop(db);

    let _ = state.broadcaster.send(json!({"type":"reorder","todos":todos}).to_string());
    Ok(HttpResponse::Ok().json(todos))
}

async fn delete_todo(path: web::Path<u64>, state: web::Data<AppState>) -> Result<HttpResponse, AppError> {
    let db = state.db.lock().await;
    let id = path.into_inner();
    let found = db::delete_todo(&db, id).map_err(|e| { eprintln!("{}", e); AppError::Database })?;
    drop(db);
    if !found {
        return Err(AppError::NotFound);
    }
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
