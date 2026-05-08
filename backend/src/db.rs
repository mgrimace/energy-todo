use rusqlite::{params, Connection, Result};
use crate::models::{Energy, NewTodo, Todo, UpdateTodo};
use std::time::{SystemTime, UNIX_EPOCH};

fn now_unix_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn energy_to_str(e: &Energy) -> &'static str {
    match e {
        Energy::High => "high",
        Energy::Medium => "medium",
        Energy::Low => "low",
    }
}

fn energy_from_str(s: &str) -> Energy {
    match s {
        "high" => Energy::High,
        "medium" => Energy::Medium,
        _ => Energy::Low,
    }
}

fn row_to_todo(row: &rusqlite::Row) -> rusqlite::Result<Todo> {
    let id: i64 = row.get(0)?;
    let title: String = row.get(1)?;
    let energy_str: String = row.get(2)?;
    let tags_json: String = row.get(3)?;
    let completed: i64 = row.get(4)?;
    let completed_at: Option<i64> = row.get(5)?;
    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
    Ok(Todo {
        id: id as u64,
        title,
        energy: energy_from_str(&energy_str),
        tags,
        completed: completed != 0,
        completed_at: completed_at.map(|v| v as u64),
    })
}

pub fn open_db(path: &str) -> Result<Connection> {
    let conn = Connection::open(path)?;
    conn.execute_batch(
        "PRAGMA journal_mode=WAL;
         CREATE TABLE IF NOT EXISTS todos (
             id       INTEGER PRIMARY KEY,
             title    TEXT    NOT NULL,
             energy   TEXT    NOT NULL,
             tags     TEXT    NOT NULL,
             completed INTEGER NOT NULL,
             completed_at INTEGER,
             position INTEGER NOT NULL
         );",
    )?;
    Ok(conn)
}

pub fn seed_if_empty(conn: &Connection) -> Result<()> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM todos", [], |r| r.get(0))?;
    if count > 0 {
        return Ok(());
    }

    // Existing users upgrading from the JSON-based version: migrate their data
    // instead of overwriting it with sample todos.
    if let Ok(data) = std::fs::read_to_string("data/todos.json") {
        let todos: Vec<serde_json::Value> = serde_json::from_str(&data).unwrap_or_default();
        if !todos.is_empty() {
            let mut active_pos = 0i64;
            let mut completed_pos = 0i64;
            for todo in &todos {
                let id = todo["id"].as_u64().unwrap_or(0) as i64;
                let title = todo["title"].as_str().unwrap_or("").to_string();
                let energy = todo["energy"].as_str().unwrap_or("medium").to_string();
                let tags = todo.get("tags")
                    .map(|t| serde_json::to_string(t).unwrap_or_else(|_| "[]".to_string()))
                    .unwrap_or_else(|| "[]".to_string());
                let is_completed = todo["completed"].as_bool().unwrap_or(false);
                let completed_at = todo.get("completedAt").and_then(|v| v.as_u64()).map(|v| v as i64);
                let position = if is_completed { let p = completed_pos; completed_pos += 1; p }
                               else           { let p = active_pos;    active_pos    += 1; p };
                conn.execute(
                    "INSERT INTO todos (id, title, energy, tags, completed, completed_at, position)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                    params![id, title, energy, tags, is_completed as i64, completed_at, position],
                )?;
            }
            return Ok(());
        }
    }

    struct Seed {
        title: &'static str,
        energy: &'static str,
        tags: &'static str,
        completed: bool,
    }

    let seeds = [
        Seed { title: "Create a new task and assign it an energy cost", energy: "low",    tags: r#"["startup"]"#, completed: false },
        Seed { title: "Battery Low? Knock out a \"quick win\"",         energy: "low",    tags: r#"["tip"]"#,     completed: false },
        Seed { title: "Feeling ok? Choose a \"balanced\" task",         energy: "medium", tags: r#"["tip"]"#,     completed: false },
        Seed { title: "Try swiping to complete this task",              energy: "medium", tags: r#"["ui"]"#,      completed: false },
        Seed { title: "Hyper focused? Select a \"focused\" task",       energy: "high",   tags: r#"["tip"]"#,     completed: false },
        Seed { title: "this is a completed task",                       energy: "high",   tags: "[]",             completed: true  },
    ];

    let mut active_pos = 0i64;
    let mut completed_pos = 0i64;

    for (i, seed) in seeds.iter().enumerate() {
        let id = (i + 1) as i64;
        let completed_val = seed.completed as i64;
        let completed_at: Option<i64> = if seed.completed { Some(1_735_000_000_000) } else { None };
        let position = if seed.completed {
            let p = completed_pos;
            completed_pos += 1;
            p
        } else {
            let p = active_pos;
            active_pos += 1;
            p
        };

        conn.execute(
            "INSERT INTO todos (id, title, energy, tags, completed, completed_at, position)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![id, seed.title, seed.energy, seed.tags, completed_val, completed_at, position],
        )?;
    }

    Ok(())
}

pub fn get_all_todos(conn: &Connection) -> Result<Vec<Todo>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, energy, tags, completed, completed_at
         FROM todos
         ORDER BY completed ASC, position ASC",
    )?;
    let rows = stmt.query_map([], row_to_todo)?.collect();
    rows
}

pub fn get_active_ids(conn: &Connection) -> Result<Vec<u64>> {
    let mut stmt =
        conn.prepare("SELECT id FROM todos WHERE completed = 0 ORDER BY position ASC")?;
    let rows = stmt
        .query_map([], |row| row.get::<_, i64>(0))?
        .map(|r| r.map(|id| id as u64))
        .collect();
    rows
}

pub fn create_todo(conn: &Connection, new_todo: &NewTodo) -> Result<Todo> {
    let max_id: i64 =
        conn.query_row("SELECT COALESCE(MAX(id), 0) FROM todos", [], |r| r.get(0))?;
    let id = max_id + 1;
    let tags_json =
        serde_json::to_string(&new_todo.tags).unwrap_or_else(|_| "[]".to_string());
    let energy = energy_to_str(&new_todo.energy);

    // High-energy tasks go to the end of active; all others prepend (position 0).
    let position: i64 = match &new_todo.energy {
        Energy::High => {
            conn.query_row("SELECT COUNT(*) FROM todos WHERE completed = 0", [], |r| {
                r.get(0)
            })?
        }
        _ => {
            conn.execute(
                "UPDATE todos SET position = position + 1 WHERE completed = 0",
                [],
            )?;
            0
        }
    };

    conn.execute(
        "INSERT INTO todos (id, title, energy, tags, completed, completed_at, position)
         VALUES (?1, ?2, ?3, ?4, 0, NULL, ?5)",
        params![id, new_todo.title, energy, tags_json, position],
    )?;

    Ok(Todo {
        id: id as u64,
        title: new_todo.title.clone(),
        energy: new_todo.energy.clone(),
        tags: new_todo.tags.clone(),
        completed: false,
        completed_at: None,
    })
}

pub fn update_todo(conn: &Connection, id: u64, patch: &UpdateTodo) -> Result<Option<Todo>> {
    let id_i64 = id as i64;

    let result = conn.query_row(
        "SELECT title, energy, tags, completed, completed_at, position FROM todos WHERE id = ?1",
        params![id_i64],
        |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, Option<i64>>(4)?,
                row.get::<_, i64>(5)?,
            ))
        },
    );

    let (curr_title, curr_energy, curr_tags, curr_completed, curr_completed_at, curr_position) =
        match result {
            Ok(v) => v,
            Err(rusqlite::Error::QueryReturnedNoRows) => return Ok(None),
            Err(e) => return Err(e),
        };

    let was_completed = curr_completed != 0;
    let new_title = patch.title.as_deref().unwrap_or(&curr_title).to_string();
    let new_energy_str = patch
        .energy
        .as_ref()
        .map(|e| energy_to_str(e).to_string())
        .unwrap_or(curr_energy);
    let new_tags_json = patch
        .tags
        .as_ref()
        .map(|t| serde_json::to_string(t).unwrap_or_else(|_| "[]".to_string()))
        .unwrap_or(curr_tags);
    let (new_completed, new_completed_at) = if let Some(c) = patch.completed {
        (c as i64, if c { Some(now_unix_millis()) } else { None })
    } else {
        (curr_completed, curr_completed_at)
    };
    let will_be_completed = new_completed != 0;

    // When completion status changes, move the todo to the front of its new group.
    let new_position = if was_completed != will_be_completed {
        if will_be_completed {
            // Completing: close the gap in active, prepend to completed.
            conn.execute(
                "UPDATE todos SET position = position - 1 WHERE completed = 0 AND position > ?1",
                params![curr_position],
            )?;
            conn.execute(
                "UPDATE todos SET position = position + 1 WHERE completed = 1",
                [],
            )?;
        } else {
            // Uncompleting: close the gap in completed, prepend to active.
            conn.execute(
                "UPDATE todos SET position = position - 1 WHERE completed = 1 AND position > ?1",
                params![curr_position],
            )?;
            conn.execute(
                "UPDATE todos SET position = position + 1 WHERE completed = 0",
                [],
            )?;
        }
        0
    } else {
        curr_position
    };

    conn.execute(
        "UPDATE todos
         SET title = ?1, energy = ?2, tags = ?3, completed = ?4, completed_at = ?5, position = ?6
         WHERE id = ?7",
        params![
            new_title,
            new_energy_str,
            new_tags_json,
            new_completed,
            new_completed_at,
            new_position,
            id_i64
        ],
    )?;

    let tags: Vec<String> = serde_json::from_str(&new_tags_json).unwrap_or_default();
    Ok(Some(Todo {
        id,
        title: new_title,
        energy: energy_from_str(&new_energy_str),
        tags,
        completed: will_be_completed,
        completed_at: new_completed_at.map(|v| v as u64),
    }))
}

pub fn delete_todo(conn: &Connection, id: u64) -> Result<bool> {
    let id_i64 = id as i64;

    let result = conn.query_row(
        "SELECT completed, position FROM todos WHERE id = ?1",
        params![id_i64],
        |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
    );

    let (was_completed, position) = match result {
        Ok(v) => v,
        Err(rusqlite::Error::QueryReturnedNoRows) => return Ok(false),
        Err(e) => return Err(e),
    };

    conn.execute("DELETE FROM todos WHERE id = ?1", params![id_i64])?;

    // Close the gap left by the deleted row.
    if was_completed != 0 {
        conn.execute(
            "UPDATE todos SET position = position - 1 WHERE completed = 1 AND position > ?1",
            params![position],
        )?;
    } else {
        conn.execute(
            "UPDATE todos SET position = position - 1 WHERE completed = 0 AND position > ?1",
            params![position],
        )?;
    }

    Ok(true)
}

pub fn reorder_active(conn: &Connection, active_ids: &[u64]) -> Result<()> {
    for (pos, &id) in active_ids.iter().enumerate() {
        conn.execute(
            "UPDATE todos SET position = ?1 WHERE id = ?2 AND completed = 0",
            params![pos as i64, id as i64],
        )?;
    }
    Ok(())
}
