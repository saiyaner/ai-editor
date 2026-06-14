use tauri::Manager;

struct PythonState {
    child: std::sync::Mutex<Option<std::process::Child>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let app = tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
        let mut path = std::env::current_dir().unwrap_or_default();
        if path.ends_with("src-tauri") {
            path.pop();
        }
        let script_path = path.join("src-python").join("main.py");

        let child = std::process::Command::new("python3")
            .arg(&script_path)
            .spawn()
            .ok();

        app.manage(PythonState {
            child: std::sync::Mutex::new(child),
        });
        Ok(())
    })
    .invoke_handler(
        tauri::generate_handler![
            read_directory,
            read_file,
            write_file,
            run_command,
            git_branch,
            git_status,
            ask_ai,
            get_models,
            autocomplete
        ]
    )
    .plugin(
        tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
    )
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  app.run(|app_handle, event| {
    if let tauri::RunEvent::Exit = event {
      if let Some(state) = app_handle.try_state::<PythonState>() {
        if let Ok(mut guard) = state.child.lock() {
          if let Some(mut child) = guard.take() {
            let _ = child.kill();
          }
        }
      }
    }
  });
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

#[derive(Serialize)]
struct AutocompleteRequest {
    prefix: String,
    suffix: String,
    model: String,
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

#[derive(serde::Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    images: Vec<String>,
    stream: bool,
}

#[tauri::command]
async fn ask_ai(
    prompt: String,
    images: Vec<String>,
    model: String,
    on_chunk: tauri::ipc::Channel<String>,
) -> Result<(), String> {
    use futures_util::StreamExt;

    let client = reqwest::Client::new();

    let mut cleaned_images = Vec::new();
    for img in images {
        if img.contains(",") {
            if let Some(pos) = img.find(',') {
                cleaned_images.push(img[pos + 1..].to_string());
            } else {
                cleaned_images.push(img.clone());
            }
        } else {
            cleaned_images.push(img.clone());
        }
    }

    let payload = OllamaRequest {
        model,
        prompt,
        images: cleaned_images,
        stream: true,
    };

    let response = client
        .post("http://localhost:11434/api/generate")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Ollama error status: {}", response.status()));
    }

    let mut stream = response.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| e.to_string())?;
        let text = String::from_utf8_lossy(&chunk);
        buffer.push_str(&text);

        while let Some(pos) = buffer.find('\n') {
            let line = buffer[..pos].trim().to_string();
            buffer = buffer[pos + 1..].to_string();

            if !line.is_empty() {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&line) {
                    if let Some(resp) = json["response"].as_str() {
                        let _ = on_chunk.send(resp.to_string());
                    }
                }
            }
        }
    }

    Ok(())
}

#[tauri::command]
async fn get_models() -> Result<Vec<String>, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("http://127.0.0.1:11435/models")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let models = json["models"]
        .as_array()
        .ok_or("Invalid response format")?
        .iter()
        .filter_map(|v| v.as_str().map(|s| s.to_string()))
        .collect();

    Ok(models)
}

#[tauri::command]
async fn autocomplete(
    prefix: String,
    suffix: String,
    model: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client
        .post("http://127.0.0.1:11435/autocomplete")
        .json(&AutocompleteRequest {
            prefix,
            suffix,
            model,
        })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    Ok(json["suggestion"]
        .as_str()
        .unwrap_or("")
        .to_string())
}