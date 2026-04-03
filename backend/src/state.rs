use rusqlite::Connection;
use std::sync::Arc;
use tokio::sync::{broadcast::Sender, Mutex};

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
    pub broadcaster: Sender<String>,
}
