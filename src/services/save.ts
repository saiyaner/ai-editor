import { invoke } from "@tauri-apps/api/core";

export async function saveFile(
  path: string,
  content: string
) {
  return invoke(
    "write_file",
    {
      path,
      content,
    }
  );
}