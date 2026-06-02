use rusqlite::Connection;
use std::collections::VecDeque;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::sync::{broadcast::Sender, Mutex};

pub const EVENT_BUFFER_LIMIT: usize = 200;

pub type EventMessage = (u64, String);

#[derive(Clone)]
pub struct ReplayBatch {
    pub events: Vec<EventMessage>,
    pub reset_required: bool,
}

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
    pub broadcaster: Sender<EventMessage>,
    next_event_id: Arc<AtomicU64>,
    event_history: Arc<Mutex<VecDeque<EventMessage>>>,
}

impl AppState {
    pub fn new(db: Connection, broadcaster: Sender<EventMessage>) -> Self {
        Self {
            db: Arc::new(Mutex::new(db)),
            broadcaster,
            next_event_id: Arc::new(AtomicU64::new(0)),
            event_history: Arc::new(Mutex::new(VecDeque::with_capacity(EVENT_BUFFER_LIMIT))),
        }
    }

    pub async fn publish(&self, payload: String) {
        let event_id = self.next_event_id.fetch_add(1, Ordering::Relaxed) + 1;
        let event = (event_id, payload);

        {
            let mut history = self.event_history.lock().await;
            history.push_back(event.clone());
            while history.len() > EVENT_BUFFER_LIMIT {
                history.pop_front();
            }
        }

        let _ = self.broadcaster.send(event);
    }

    pub async fn replay_since(&self, last_event_id: u64) -> ReplayBatch {
        let history = self.event_history.lock().await;

        let oldest_id = history.front().map(|(id, _)| *id);
        let reset_required =
            matches!(oldest_id, Some(oldest) if last_event_id > 0 && last_event_id < oldest);
        let events = history
            .iter()
            .filter(|(id, _)| *id > last_event_id)
            .cloned()
            .collect();

        ReplayBatch {
            events,
            reset_required,
        }
    }
}
