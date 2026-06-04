import { defineStore } from "pinia";
import { ref } from "vue";

export interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
  dirty: boolean;
}

export const useEditorStore = defineStore("editor", () => {
  const files = ref<EditorFile[]>([]);

  const currentFile = ref<EditorFile | null>(null);

  function openFile(file: EditorFile) {
    const exists = files.value.find(
      (f) => f.id === file.id
    );

    if (!exists) {
      files.value.push(file);
    }

    currentFile.value = file;
  }

  function closeFile(id: string) {
    files.value = files.value.filter(
      (file) => file.id !== id
    );

    if (currentFile.value?.id === id) {
      currentFile.value =
        files.value[files.value.length - 1] ?? null;
    }
  }

  function markSaved(id: string) {
    const file = files.value.find(
      (f) => f.id === id
    );

    if (!file) return;

    file.dirty = false;
  }

  return {
    files,
    currentFile,
    openFile,
    closeFile,
    markSaved,
  };
});