use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Energy {
    Low,
    Medium,
    High,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Todo {
    pub id: u64,
    pub title: String,
    pub energy: Energy,
    #[serde(default)]
    pub tags: Vec<String>,
    pub completed: bool,
    #[serde(default, rename = "completedAt")]
    pub completed_at: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct NewTodo {
    pub title: String,
    pub energy: Energy,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodo {
    pub title: Option<String>,
    pub energy: Option<Energy>,
    pub tags: Option<Vec<String>>,
    pub completed: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ReorderTodos {
    pub active_ids: Vec<u64>,
}
