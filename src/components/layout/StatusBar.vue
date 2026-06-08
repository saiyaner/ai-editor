<script setup lang="ts">
import { useEditorStore } from "@/app/stores/editor";
import { useUiStore } from "@/app/stores/ui";
import { useGitStore } from "@/app/stores/git";

const editorStore =
  useEditorStore();

const uiStore =
  useUiStore();

const gitStore =
  useGitStore();

</script>

<template>
  <footer class="status-bar">

    <div>
      View: {{ uiStore.activeView }}
    </div>

    <div>
      File: {{ editorStore.currentFile?.name ?? "No File" }}
    </div>
    
    <div v-if="gitStore.branch">
      🌿 {{ gitStore.branch }}
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