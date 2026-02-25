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
    pub completed: bool,
}

#[derive(Debug, Deserialize)]
pub struct NewTodo {
    pub title: String,
    pub energy: Energy,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodo {
    pub title: Option<String>,
    pub energy: Option<Energy>,
    pub completed: Option<bool>,
}
