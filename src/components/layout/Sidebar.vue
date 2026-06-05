<script setup lang="ts">
import { computed } from "vue";
import { useExplorerStore } from "@/app/stores/explorer";
import OpenFolderButton from "@/components/sidebar/OpenFolderButton.vue";
import FileTreeNode from "@/components/sidebar/FileTreeNode.vue";

const explorerStore = useExplorerStore();

const folderName = computed(() => {
  if (!explorerStore.rootPath) return "";
  const parts = explorerStore.rootPath.split(/[\/\\]/);
  return parts[parts.length - 1] || explorerStore.rootPath;
});
</script>

<template>
  <div class="sidebar">
    <div v-if="explorerStore.rootPath" class="explorer-view">
      <div class="explorer-header">
        <h3 class="folder-title" :title="explorerStore.rootPath">
          {{ folderName }}
        </h3>
        <OpenFolderButton class="change-folder-btn" label="Change..." />
      </div>

      <div class="explorer-tree">
        <FileTreeNode
          v-for="node in explorerStore.tree"
          :key="node.path"
          :node="node"
        />
      </div>
    </div>

    <div v-else class="empty-explorer">
      <div class="empty-icon">📁</div>
      <p class="empty-text">No folder opened</p>
      <OpenFolderButton class="primary-open-btn" />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #161b22;
  color: #c9d1d9;
  box-sizing: border-box;
}

.explorer-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #30363d;
}

.folder-title {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #8b949e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.explorer-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-explorer {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  gap: 12px;
}

.empty-icon {
  font-size: 40px;
  opacity: 0.4;
}

.empty-text {
  font-size: 13px;
  color: #8b949e;
  margin: 0;
}

/* OpenFolderButton Styling overrides */
:deep(button) {
  background-color: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

:deep(button:hover) {
  background-color: #30363d;
  border-color: #8b949e;
  color: #f0f6fc;
}

:deep(.primary-open-btn button) {
  background-color: #238636;
  color: #ffffff;
  border: 1px solid #2ea043;
  font-size: 13px;
  padding: 8px 16px;
}

:deep(.primary-open-btn button:hover) {
  background-color: #2ea043;
  border-color: #3fb950;
}
</style>