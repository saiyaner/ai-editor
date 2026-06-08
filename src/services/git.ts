import { invoke } from "@tauri-apps/api/core";
import type { GitFile } from "@/app/types/git";

export async function getBranch(
  cwd: string
) {
  return invoke<string>(
    "git_branch",
    { cwd }
  );
}

export async function getStatus(
  cwd: string
) {

  return invoke<GitFile[]>(
    "git_status",
    { cwd }
  );
}