mod db;
mod errors;
mod models;
mod routes;
mod state;

use actix_files::{Files, NamedFile};
use actix_web::{dev::Service, error, http::header, web, App, HttpRequest, HttpResponse, HttpServer, Responder, ResponseError, Result};
use std::fs;
use std::path::Path;
use std::sync::Arc;
use state::AppState;
use tracing::info;
use tracing_actix_web::TracingLogger;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();

    let db_path = "data/todos.db";

    if let Some(parent) = Path::new(db_path).parent() {
        fs::create_dir_all(parent)?;
    }
    let conn = db::open_db(db_path).map_err(|e| {
        std::io::Error::other(format!("failed to open database: {}", e))
    })?;
    db::seed_if_empty(&conn).map_err(|e| {
        std::io::Error::other(format!("failed to seed database: {}", e))
    })?;

    let (broadcaster, _rx) = tokio::sync::broadcast::channel::<String>(100);

    let app_state = AppState {
        db: Arc::new(tokio::sync::Mutex::new(conn)),
        broadcaster,
    };

    let addr = ("0.0.0.0", 3000);
    info!(listen_host = addr.0, listen_port = addr.1, "starting energy todo backend");

    async fn spa_index(req: HttpRequest) -> Result<HttpResponse> {
        let accepts_html = req
            .headers()
            .get(header::ACCEPT)
            .and_then(|value| value.to_str().ok())
            .map(|accept| accept.contains("text/html"))
            .unwrap_or(false);

        let path = req.path();
        let looks_like_asset = path.contains('.');

        if !accepts_html || looks_like_asset {
            return Err(error::ErrorNotFound("not found"));
        }

        Ok(NamedFile::open("./dist/index.html")?
            .use_etag(true)
            .use_last_modified(true)
            .customize()
            .insert_header((header::CACHE_CONTROL, "no-cache"))
            .respond_to(&req)
            .map_into_boxed_body())
    }

    let json_config = web::JsonConfig::default()
        .limit(16 * 1024)
        .error_handler(|err, _req| {
            let app_err = match err {
                actix_web::error::JsonPayloadError::OverflowKnownLength { .. }
                | actix_web::error::JsonPayloadError::Overflow { .. } => crate::errors::AppError::PayloadTooLarge,
                _ => crate::errors::AppError::BadRequest,
            };
            actix_web::error::InternalError::from_response(err, app_err.error_response()).into()
        });

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(app_state.clone()))
            .app_data(json_config.clone())
            .wrap_fn(|req, srv| {
                let path = req.path().to_owned();
                let fut = srv.call(req);

                async move {
                    let mut res = fut.await?;

                    let is_static_asset = path.starts_with("/assets/") || path.ends_with(".js") || path.ends_with(".css") || path.ends_with(".png") || path.ends_with(".jpg") || path.ends_with(".jpeg") || path.ends_with(".svg") || path.ends_with(".ico") || path.ends_with(".webmanifest") || path.ends_with(".woff") || path.ends_with(".woff2");
                    if is_static_asset {
                        res.headers_mut().insert(
                            header::CACHE_CONTROL,
                            header::HeaderValue::from_static("public, max-age=31536000, immutable"),
                        );
                    }

                    if path == "/index.html" {
                        res.headers_mut().insert(
                            header::CACHE_CONTROL,
                            header::HeaderValue::from_static("no-cache"),
                        );
                    }

                    Ok::<_, actix_web::Error>(res)
                }
            })
            .wrap(TracingLogger::default())
            // register API routes before static files
            .service(web::scope("/api").configure(routes::configure_api))
            // serve static files from /app/dist mounted at ./dist in image
            .service(
                Files::new("/", "./dist")
                    .index_file("index.html")
                    .default_handler(web::to(spa_index)),
            )
    })
    .bind(addr)?
    .run()
    .await
}


