use crate::models::Todo;
use crate::storage::StorageError;
use std::sync::Arc;
use tokio::sync::{broadcast::Sender, mpsc, oneshot, Mutex as AsyncMutex, RwLock};

pub struct PersistRequest {
    pub snapshot: Vec<Todo>,
    pub respond_to: oneshot::Sender<Result<Vec<Todo>, StorageError>>,
}

#[derive(Clone)]
pub struct AppState {
    pub todos: Arc<RwLock<Vec<Todo>>>,
    pub broadcaster: Sender<String>,
    pub persist_tx: mpsc::Sender<PersistRequest>,
    pub write_lock: Arc<AsyncMutex<()>>,
}
