<script setup lang="ts">
import { open } from "@tauri-apps/plugin-dialog";
import { useExplorerStore } from "@/app/stores/explorer";
import { readDirectory } from "@/services/explorer";
import type { FileNode } from "@/app/types/tree";

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

  explorerStore.setRoot(folder);

  const tree =
    await readDirectory(folder as string);

  explorerStore.setTree(tree as FileNode[]);
};
</script>

<template>
  <button @click="pickFolder">
    {{ label }}
  </button>
</template>