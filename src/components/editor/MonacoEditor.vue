<script setup lang="ts">
import * as monaco from "monaco-editor";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useEditorStore } from "@/app/stores/editor";
import { writeFile } from "@/services/explorer";

const editorStore = useEditorStore();

const editorContainer = ref<HTMLDivElement | null>(null);

let editor: monaco.editor.IStandaloneCodeEditor;

const handleSave = async (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();

    if (!editorStore.currentFile) return;

    try {
      await writeFile(editorStore.currentFile.id, editorStore.currentFile.content);
      editorStore.markSaved(
        editorStore.currentFile.id
      );
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  }
};

onMounted(() => {
  if (!editorContainer.value) return;

  editor = monaco.editor.create(
    editorContainer.value,
    {
      value: "",
      language: "typescript",
      theme: "vs-dark",
      automaticLayout: true,
    }
  );

  let isLoadingFile = false;

  watch(
    () => editorStore.currentFile,
    (file) => {
      if (!file) return;

      isLoadingFile = true;

      editor.setValue(file.content);

      monaco.editor.setModelLanguage(
        editor.getModel()!,
        file.language
      );

      isLoadingFile = false;
    },
    {
      immediate: true,
    }
  );

  editor.onDidChangeModelContent(() => {
    if (isLoadingFile) return;

    if (!editorStore.currentFile) return;

    editorStore.currentFile.content =
      editor.getValue();

    editorStore.currentFile.dirty = true;
  });

  window.addEventListener("keydown", handleSave);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleSave);
  editor?.dispose();
});
</script>

<template>
  <div
    ref="editorContainer"
    class="editor"
  />
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
}
</style>