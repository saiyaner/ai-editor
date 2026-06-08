#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(
        tauri::generate_handler![
            read_directory,
            read_file,
            write_file,
            run_command,
            git_branch,
            git_status
        ]
    )
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

#[derive(Serialize)]
struct GitFile {
    status: String,
    path: String,
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

#[tauri::command]
fn run_command(
    command: String,
    cwd: String,
) -> Result<String, String> {

    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(command)
        .current_dir(cwd)
        .output()
        .map_err(|e| e.to_string())?;

    let stdout =
        String::from_utf8_lossy(
            &output.stdout
        );

    let stderr =
        String::from_utf8_lossy(
            &output.stderr
        );

    Ok(format!(
        "{}{}",
        stdout,
        stderr
    ))
}

#[tauri::command]
fn git_branch(
    cwd: String,
) -> Result<String, String> {

    let output =
        std::process::Command::new("git")
            .args([
                "branch",
                "--show-current"
            ])
            .current_dir(cwd)
            .output()
            .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Ok("".to_string());
    }

    Ok(
        String::from_utf8_lossy(
            &output.stdout
        )
        .trim()
        .to_string()
    )
}

#[tauri::command]
fn git_status(
    cwd: String,
) -> Result<Vec<GitFile>, String> {

    let output =
        std::process::Command::new("git")
            .args([
                "status",
                "--porcelain"
            ])
            .current_dir(cwd)
            .output()
            .map_err(|e| e.to_string())?;

    let text =
        String::from_utf8_lossy(
            &output.stdout
        );

    let mut files =
        Vec::new();

    for line in text.lines() {

        if line.len() < 4 {
            continue;
        }

        let status =
            line[0..2]
                .trim()
                .to_string();

        let path =
            line[3..]
                .to_string();

        files.push(
            GitFile {
                status,
                path,
            }
        );
    }

    Ok(files)
}