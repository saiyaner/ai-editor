<script setup lang="ts">
import { useEditorStore } from "@/app/stores/editor";

const editorStore = useEditorStore();
</script>

<template>
  <div class="tabs">

    <div
      v-for="file in editorStore.files"
      :key="file.id"
      class="tab"
      :class="{
        active: file.id === editorStore.currentFile?.id
      }"
      @click="editorStore.currentFile = file"
    >
      <span class="file-name">
        {{ file.name }}

        <span
          v-if="file.dirty"
          class="dirty-dot"
        >
          ●
        </span>
      </span>

      <button
        class="close-btn"
        @click.stop="
          editorStore.closeFile(file.id)
        "
      >
        ×
      </button>

    </div>

  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid #333;
  background: #181818;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 12px;

  border-right: 1px solid #333;

  cursor: pointer;
}

.tab:hover {
  background: #222;
}

.active {
  background: #2a2a2a;
}

.close-btn {
  border: none;
  background: transparent;

  cursor: pointer;

  color: #aaa;

  font-size: 14px;
}

.close-btn:hover {
  color: white;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dirty-dot {
  color: orange;
  font-size: 10px;
}
</style>