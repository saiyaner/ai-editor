<script setup lang="ts">
import { open } from "@tauri-apps/plugin-dialog";
import { useExplorerStore } from "@/app/stores/explorer";
import { readDirectory } from "@/services/explorer";
import type { FileNode } from "@/app/types/tree";
import { getBranch, getStatus } from "@/services/git";
import { useGitStore } from "@/app/stores/git";

const explorerStore =
  useExplorerStore();

const props = withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "Open Folder",
  }
);

async function pickFolder() {
  const folder = await open({
  directory: true,
  multiple: false,
  });

  if (!folder) return;

  explorerStore.setRoot(folder as string);
  const gitStore = useGitStore();

  let branch = "";
  try {
    branch = await getBranch(folder as string);
  } catch (error) {
    console.error("Failed to get git branch:", error);
  }
  gitStore.setBranch(branch);

  const status = await getStatus(folder as string);
  gitStore.setFiles(status);

  const tree = await readDirectory(folder as string);
  explorerStore.setTree(tree as FileNode[]);
};
</script>

<template>
  <button @click="pickFolder">
    {{ label }}
  </button>
</template>