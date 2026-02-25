use crate::models::Todo;
use fs2::FileExt;
use std::fs;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

static TEMP_COUNTER: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("json parse error: {0}")]
    JsonParse(#[from] serde_json::Error),
    #[error("storage worker join error: {0}")]
    Join(#[from] tokio::task::JoinError),
    #[error("failed to quarantine malformed json at {path}: {source}")]
    QuarantineFailed { path: String, source: std::io::Error },
}

fn recovery_enabled() -> bool {
    matches!(
        std::env::var("ALLOW_JSON_RECOVERY")
            .ok()
            .as_deref()
            .map(|v| v.to_ascii_lowercase()),
        Some(v) if v == "1" || v == "true" || v == "yes"
    )
}

pub fn load_todos(path: &str) -> Result<Vec<Todo>, StorageError> {
    load_todos_internal(path, recovery_enabled())
}

fn load_todos_internal(path: &str, allow_recovery: bool) -> Result<Vec<Todo>, StorageError> {
    let data = match fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => "[]".to_string(),
        Err(e) => return Err(StorageError::Io(e)),
    };

    match serde_json::from_str::<Vec<Todo>>(&data) {
        Ok(todos) => Ok(todos),
        Err(parse_err) => {
            if !allow_recovery {
                return Err(StorageError::JsonParse(parse_err));
            }

            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();
            let quarantine_path = format!("{}.corrupt.{}", path, timestamp);

            fs::rename(path, &quarantine_path).map_err(|source| StorageError::QuarantineFailed {
                path: quarantine_path.clone(),
                source,
            })?;

            Ok(Vec::new())
        }
    }
}

pub fn save_todos(path: &str, todos: &[Todo]) -> Result<(), StorageError> {
    let data = serde_json::to_string_pretty(todos)?;

    if let Some(parent) = Path::new(path).parent() {
        fs::create_dir_all(parent)?;
    }

    let lock_path = format!("{}.lock", path);
    let lock_file = OpenOptions::new()
        .create(true)
        .read(true)
        .write(true)
        .truncate(false)
        .open(&lock_path)?;
    lock_file.lock_exclusive()?;

    let tmp_path = format!(
        "{}.tmp.{}.{}",
        path,
        std::process::id(),
        TEMP_COUNTER.fetch_add(1, Ordering::Relaxed)
    );
    {
        let mut tmp_file = OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(true)
            .open(&tmp_path)?;
        tmp_file.write_all(data.as_bytes())?;
        tmp_file.sync_all()?;
    }

    fs::rename(&tmp_path, path)?;

    #[cfg(unix)]
    if let Some(parent) = Path::new(path).parent() {
        if let Ok(dir) = fs::OpenOptions::new().read(true).open(parent) {
            let _ = dir.sync_all();
        }
    }

    let _ = lock_file.unlock();

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::Energy;
    use std::sync::{Arc, Barrier};
    use std::thread;

    fn unique_test_dir() -> std::path::PathBuf {
        static TEST_COUNTER: AtomicU64 = AtomicU64::new(0);
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        let n = TEST_COUNTER.fetch_add(1, Ordering::Relaxed);
        std::env::temp_dir().join(format!("energy_todo_storage_test_{}_{}_{}", std::process::id(), ts, n))
    }

    #[test]
    fn save_and_load_roundtrip() {
        let dir = unique_test_dir();
        fs::create_dir_all(&dir).expect("create test dir");
        let path = dir.join("todos.json");

        let todos = vec![
            Todo {
                id: 1,
                title: "one".to_string(),
                energy: Energy::Low,
                completed: false,
            },
            Todo {
                id: 2,
                title: "two".to_string(),
                energy: Energy::High,
                completed: true,
            },
        ];

        save_todos(path.to_str().expect("utf8 path"), &todos).expect("save todos");
        let loaded = load_todos_internal(path.to_str().expect("utf8 path"), false).expect("load todos");

        assert_eq!(loaded.len(), 2);
        assert_eq!(loaded[0].id, 1);
        assert_eq!(loaded[1].title, "two");

        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn malformed_json_without_recovery_returns_parse_error() {
        let dir = unique_test_dir();
        fs::create_dir_all(&dir).expect("create test dir");
        let path = dir.join("todos.json");

        fs::write(&path, "{ not valid json").expect("write malformed json");
        let result = load_todos_internal(path.to_str().expect("utf8 path"), false);

        assert!(matches!(result, Err(StorageError::JsonParse(_))));

        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn malformed_json_with_recovery_quarantines_and_returns_empty() {
        let dir = unique_test_dir();
        fs::create_dir_all(&dir).expect("create test dir");
        let path = dir.join("todos.json");

        fs::write(&path, "{ not valid json").expect("write malformed json");
        let loaded = load_todos_internal(path.to_str().expect("utf8 path"), true).expect("recovery load");

        assert!(loaded.is_empty());
        assert!(!path.exists());

        let quarantine_exists = fs::read_dir(&dir)
            .expect("read dir")
            .filter_map(Result::ok)
            .any(|entry| {
                entry
                    .file_name()
                    .to_string_lossy()
                    .starts_with("todos.json.corrupt.")
            });
        assert!(quarantine_exists);

        let _ = fs::remove_dir_all(dir);
    }

    #[test]
    fn concurrent_saves_do_not_corrupt_json() {
        let dir = unique_test_dir();
        fs::create_dir_all(&dir).expect("create test dir");
        let path = dir.join("todos.json");
        let path_str = path.to_str().expect("utf8 path").to_string();

        let todos_a = vec![Todo {
            id: 11,
            title: "alpha".to_string(),
            energy: Energy::Low,
            completed: false,
        }];
        let todos_b = vec![Todo {
            id: 22,
            title: "beta".to_string(),
            energy: Energy::High,
            completed: true,
        }];

        let expected_a = todos_a.clone();
        let expected_b = todos_b.clone();

        let barrier = Arc::new(Barrier::new(3));

        let writer_a_path = path_str.clone();
        let writer_a_barrier = barrier.clone();
        let writer_a = thread::spawn(move || {
            writer_a_barrier.wait();
            for _ in 0..25 {
                save_todos(&writer_a_path, &todos_a).expect("writer a save");
            }
        });

        let writer_b_path = path_str.clone();
        let writer_b_barrier = barrier.clone();
        let writer_b = thread::spawn(move || {
            writer_b_barrier.wait();
            for _ in 0..25 {
                save_todos(&writer_b_path, &todos_b).expect("writer b save");
            }
        });

        barrier.wait();
        writer_a.join().expect("writer a join");
        writer_b.join().expect("writer b join");

        let loaded = load_todos_internal(&path_str, false).expect("load final todos");
        assert!(loaded == expected_a || loaded == expected_b);

        let _ = fs::remove_dir_all(dir);
    }
}
