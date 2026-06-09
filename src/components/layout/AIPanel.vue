<script setup lang="ts">
import AIChat from "@/components/ai/AIChat.vue";
import { useEditorStore } from "@/app/stores/editor";

const editor =
  useEditorStore();
</script>

<template>
  <div class="ai-panel">
    <div class="panel-header">
      🤖 AI Assistant

      <span
        v-if="
          editor.currentFile
        "
        class="file-context"
      >
        {{ editor.currentFile.name }}
      </span>
    </div>

    <AIChat />
  </div>
</template>

<style scoped>
.ai-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0f172a;
}

.panel-header {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #1e293b;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.file-context {
  margin-left: auto;
  opacity: 0.6;
  font-size: 11px;
}
</style>