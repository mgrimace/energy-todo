mod models;
mod routes;
mod storage;
mod state;
mod errors;

use actix_cors::Cors;
use actix_files::{Files, NamedFile};
use actix_web::{dev::Service, error, http::header, http::Uri, web, App, HttpRequest, HttpResponse, HttpServer, Responder, ResponseError, Result};
use std::collections::HashSet;
use std::sync::Arc;
use models::Todo;
use storage::load_todos;
use state::{AppState, PersistRequest};
use tracing::info;
use tracing_actix_web::TracingLogger;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
struct CompiledCorsOrigins {
    exact: Vec<String>,
}

fn allowed_origins_from_env() -> Vec<String> {
    let configured = std::env::var("CORS_ALLOWED_ORIGINS")
        .ok()
        .map(|value| {
            value
                .split(',')
                .map(str::trim)
                .filter(|origin| !origin.is_empty())
                .map(ToOwned::to_owned)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    if configured.is_empty() {
        vec![
            "http://localhost:5173".to_string(),
            "http://127.0.0.1:5173".to_string(),
            "http://localhost:3000".to_string(),
            "http://127.0.0.1:3000".to_string(),
        ]
    } else {
        configured
    }
}

fn compile_allowed_origins(allowed_origins: &[String]) -> Result<CompiledCorsOrigins, String> {
    let mut invalid = Vec::new();
    let mut exact = HashSet::new();

    for origin in allowed_origins {
        let parsed = origin.parse::<Uri>();
        match parsed {
            Ok(uri)
                if matches!(uri.scheme_str(), Some("http") | Some("https"))
                    && uri.authority().is_some() => {
                exact.insert(origin.clone());
            }
            _ => invalid.push(origin.clone()),
        }
    }

    if invalid.is_empty() {
        Ok(CompiledCorsOrigins {
            exact: exact.into_iter().collect(),
        })
    } else {
        Err(format!(
            "invalid CORS_ALLOWED_ORIGINS value(s): {}. Use exact origins like https://app.example.com or http://192.168.1.20:3000",
            invalid.join(", ")
        ))
    }
}

fn build_cors(compiled_origins: &CompiledCorsOrigins) -> Cors {
    let mut cors = Cors::default()
        .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE", "OPTIONS"])
        .allowed_headers(vec![header::ACCEPT, header::CONTENT_TYPE])
        .max_age(3600);

    for origin in &compiled_origins.exact {
        cors = cors.allowed_origin(origin);
    }

    cors
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();

    // runtime data path inside container
    let data_path = "data/todos.json".to_string();
    let todos = load_todos(&data_path).map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("failed to load todos from {}: {}", data_path, e),
        )
    })?;
    let shared_state: Arc<RwLock<Vec<Todo>>> = Arc::new(RwLock::new(todos));

    let (broadcaster, _rx) = tokio::sync::broadcast::channel::<String>(100);
    let (persist_tx, mut persist_rx) = tokio::sync::mpsc::channel::<PersistRequest>(64);
    let persist_path = data_path.clone();

    tokio::spawn(async move {
        while let Some(request) = persist_rx.recv().await {
            let snapshot = request.snapshot;
            let path = persist_path.clone();
            let result = tokio::task::spawn_blocking(move || {
                storage::save_todos(&path, &snapshot)
                    .map(|_| snapshot)
            })
            .await
            .map_err(storage::StorageError::Join)
            .and_then(|r| r);

            let _ = request.respond_to.send(result);
        }
    });

    let app_state = AppState {
        todos: shared_state.clone(),
        broadcaster,
        persist_tx,
        write_lock: Arc::new(tokio::sync::Mutex::new(())),
    };

    let allowed_origins = allowed_origins_from_env();
    let compiled_origins = compile_allowed_origins(&allowed_origins)
        .map_err(|message| std::io::Error::new(std::io::ErrorKind::InvalidInput, message))?;

    let addr = ("0.0.0.0", 3000);
    info!(
        listen_host = addr.0,
        listen_port = addr.1,
        cors_origins = ?allowed_origins,
        "starting energy todo backend"
    );

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
            .wrap(build_cors(&compiled_origins))
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
