<script setup lang="ts">
import EditorTabs from "@/components/editor/EditorTabs.vue";
import MonacoEditor from "@/components/editor/MonacoEditor.vue";

import { useEditorStore } from "@/app/stores/editor";

const editorStore = useEditorStore();
</script>

<template>
  <div class="editor-area">

    <EditorTabs />

    <div class="editor-content">

      <MonacoEditor
        v-if="editorStore.currentFile"
      />

      <div
        v-else
        class="empty-state"
      >
        Open a file
      </div>

    </div>

  </div>
</template>

<style scoped>
.editor-area {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-content {
  flex: 1;
}

.empty-state {
  padding: 20px;
}
</style>