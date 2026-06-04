<script setup lang="ts">
import { useEditorStore } from "@/app/stores/editor";
import { useUiStore } from "@/app/stores/ui";

const editorStore = useEditorStore();
const uiStore = useUiStore();
</script>

<template>
  <footer class="status-bar">

    <div>
      View: {{ uiStore.activeView }}
    </div>

    <div>
      File: {{ editorStore.currentFile?.name ?? "No File" }}
    </div>

  </footer>
</template>

<style scoped>
.status-bar {
  height: 30px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 12px;

  border-top: 1px solid #333;

  font-size: 12px;
}
</style>