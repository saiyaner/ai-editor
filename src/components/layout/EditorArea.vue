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
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.empty-state {
  padding: 20px;
}
</style>