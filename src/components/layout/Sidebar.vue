<script setup lang="ts">
import { computed } from "vue";
import { useExplorerStore } from "@/app/stores/explorer";
import { useUiStore } from "@/app/stores/ui";
import OpenFolderButton from "@/components/sidebar/OpenFolderButton.vue";
import FileTreeNode from "@/components/sidebar/FileTreeNode.vue";
import GitPanel from "@/components/sidebar/GitPanel.vue";

const explorerStore = useExplorerStore();
const uiStore = useUiStore();

const folderName = computed(() => {
  if (!explorerStore.rootPath) return "";
  const parts = explorerStore.rootPath.split(/[\/\\]/);
  return parts[parts.length - 1] || explorerStore.rootPath;
});
</script>

<template>
  <div class="sidebar">

    <!-- ===== EXPLORER (Folder Icon) ===== -->
    <template v-if="uiStore.activeView === 'explorer'">
      <div class="panel-header">
        <span class="panel-title">EXPLORER</span>
      </div>

      <!-- Folder terbuka → tampilkan file tree -->
      <div v-if="explorerStore.rootPath" class="explorer-view">
        <div class="folder-row">
          <span class="folder-name">{{ folderName }}</span>
          <OpenFolderButton class="btn-change" label="Change..." />
        </div>
        <div class="tree-scroll">
          <FileTreeNode
            v-for="node in explorerStore.tree"
            :key="node.path"
            :node="node"
          />
        </div>
      </div>

      <!-- Belum ada folder → empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">📂</div>
        <p class="empty-title">No folder opened</p>
        <p class="empty-sub">Open a folder to browse files</p>
        <OpenFolderButton class="btn-open-primary" />
      </div>
    </template>

    <!-- ===== SOURCE CONTROL (Leaf / Git Icon) ===== -->
    <template v-else-if="uiStore.activeView === 'git'">
      <!-- Folder terbuka → tampilkan Git panel -->
      <div v-if="explorerStore.rootPath" class="git-view">
        <GitPanel />
      </div>
      <!-- Belum ada folder → empty state -->
      <div v-else class="empty-state">
        <div class="panel-header">
          <span class="panel-title">SOURCE CONTROL</span>
        </div>
        <div class="empty-state-body">
          <div class="empty-icon">🌿</div>
          <p class="empty-title">No repository found</p>
          <p class="empty-sub">Open a Git repository folder first</p>
          <OpenFolderButton class="btn-open-primary" />
        </div>
      </div>
    </template>

    <!-- ===== SEARCH ===== -->
    <template v-else-if="uiStore.activeView === 'search'">
      <div class="panel-header">
        <span class="panel-title">SEARCH</span>
      </div>
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">Search</p>
        <p class="empty-sub">Coming soon...</p>
      </div>
    </template>

    <!-- ===== AI ===== -->
    <template v-else-if="uiStore.activeView === 'ai'">
      <div class="panel-header">
        <span class="panel-title">AI ASSISTANT</span>
      </div>
      <div class="empty-state">
        <div class="empty-icon">🤖</div>
        <p class="empty-title">AI Assistant</p>
        <p class="empty-sub">Coming soon...</p>
      </div>
    </template>

    <!-- ===== SETTINGS ===== -->
    <template v-else-if="uiStore.activeView === 'settings'">
      <div class="panel-header">
        <span class="panel-title">SETTINGS</span>
      </div>
      <div class="empty-state">
        <div class="empty-icon">⚙️</div>
        <p class="empty-title">Settings</p>
        <p class="empty-sub">Coming soon...</p>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* === Base === */
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #161b22;
  color: #c9d1d9;
  overflow: hidden;
}

/* === Shared Panel Header === */
.panel-header {
  display: flex;
  align-items: center;
  padding: 10px 14px 9px;
  border-bottom: 1px solid #30363d;
  background-color: #0d1117;
  flex-shrink: 0;
}

.panel-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #8b949e;
  user-select: none;
}

/* === Explorer View === */
.explorer-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.folder-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 7px;
  border-bottom: 1px solid #21262d;
  flex-shrink: 0;
  background-color: #161b22;
}

.folder-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8b949e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.tree-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

/* scrollbar */
.tree-scroll::-webkit-scrollbar { width: 6px; }
.tree-scroll::-webkit-scrollbar-track { background: transparent; }
.tree-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }

/* === Git View === */
.git-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* === Empty State === */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
  gap: 10px;
}

.empty-state-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  gap: 10px;
}

.empty-icon {
  font-size: 44px;
  opacity: 0.3;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #c9d1d9;
  margin: 0;
}

.empty-sub {
  font-size: 12px;
  color: #8b949e;
  margin: 0;
  line-height: 1.5;
}

/* === Button overrides === */
:deep(.btn-change button) {
  background: transparent;
  color: #8b949e;
  border: 1px solid #30363d;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 0.15s, color 0.15s;
}
:deep(.btn-change button:hover) {
  background: #21262d;
  color: #c9d1d9;
}

:deep(.btn-open-primary button) {
  background: #238636;
  color: #fff;
  border: 1px solid #2ea043;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}
:deep(.btn-open-primary button:hover) {
  background: #2ea043;
}
</style>