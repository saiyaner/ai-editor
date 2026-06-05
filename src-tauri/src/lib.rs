#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![read_directory, read_file, write_file])
    .plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    )
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

use serde::Serialize;
use std::fs;

#[derive(Serialize)]
struct FileNode {
  name: String,
  path: String,
  is_dir: bool,
  children: Vec<FileNode>,
}

fn build_tree(path: &std::path::Path) -> Vec<FileNode> {
    let mut nodes = Vec::new();

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let path_buf = entry.path();

            let is_dir = path_buf.is_dir();

            let children = if is_dir {
                build_tree(&path_buf)
            } else {
                Vec::new()
            };

            nodes.push(FileNode {
                name: entry.file_name()
                    .to_string_lossy()
                    .to_string(),

                path: path_buf
                    .to_string_lossy()
                    .to_string(),

                is_dir,

                children,
            });
        }
    }

    nodes.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            return b.is_dir.cmp(&a.is_dir);
        }
        a.name.to_lowercase().cmp(&b.name.to_lowercase())
    });

    nodes
}

#[tauri::command]
fn read_directory(path: String) -> Vec<FileNode> {
    build_tree(std::path::Path::new(&path))
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}