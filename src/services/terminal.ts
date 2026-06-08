import { invoke }
from "@tauri-apps/api/core";

export async function runCommand(
  command: string,
  cwd: string
) {

  return invoke<string>(
    "run_command",
    {
      command,
      cwd,
    }
  );
}