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
  <div class="h-full flex flex-col bg-surface-container-low text-on-surface overflow-hidden select-none">

    <!-- ===== EXPLORER ===== -->
    <template v-if="uiStore.activeView === 'explorer'">
      <div class="h-10 flex items-center px-4 shrink-0 text-[11px] font-bold tracking-wider text-on-surface-variant border-b border-outline-variant bg-surface-container-low">
        EXPLORER
      </div>

      <!-- Folder open -->
      <div v-if="explorerStore.rootPath" class="flex flex-col h-full overflow-hidden">
        <div class="h-9 shrink-0 flex items-center justify-between px-3 border-b border-outline-variant bg-surface-container-low">
          <div class="flex items-center gap-1 text-on-surface font-bold text-xs truncate max-w-[160px]">
            <span class="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
            <span class="truncate font-semibold text-[13px]">{{ folderName.toUpperCase() }}</span>
          </div>
          <OpenFolderButton class="btn-change" label="Change" />
        </div>
        <div class="flex-1 overflow-y-auto py-1 scrollbar-thin">
          <FileTreeNode
            v-for="node in explorerStore.tree"
            :key="node.path"
            :node="node"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/40">folder_open</span>
        <div class="space-y-1">
          <p class="text-xs font-semibold text-on-surface">No Workspace</p>
          <p class="text-[11px] text-on-surface-variant leading-relaxed max-w-[180px]">Open a local directory to begin coding.</p>
        </div>
        <OpenFolderButton class="btn-open-primary mt-2" />
      </div>
    </template>

    <!-- ===== SOURCE CONTROL ===== -->
    <template v-else-if="uiStore.activeView === 'git'">
      <div v-if="explorerStore.rootPath" class="flex-1 flex flex-col overflow-hidden">
        <GitPanel />
      </div>
      <div v-else class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div class="h-10 flex items-center px-4 shrink-0 text-[11px] font-bold tracking-wider text-on-surface-variant border-b border-outline-variant w-full absolute top-0 left-0 bg-surface-container-low">
          SOURCE CONTROL
        </div>
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/40 mt-8">account_tree</span>
        <div class="space-y-1">
          <p class="text-xs font-semibold text-on-surface">No Git Repository</p>
          <p class="text-[11px] text-on-surface-variant leading-relaxed max-w-[180px]">Open a folder containing a Git repo to track changes.</p>
        </div>
        <OpenFolderButton class="btn-open-primary mt-2" />
      </div>
    </template>

    <!-- ===== SEARCH ===== -->
    <template v-else-if="uiStore.activeView === 'search'">
      <div class="h-10 flex items-center px-4 shrink-0 text-[11px] font-bold tracking-wider text-on-surface-variant border-b border-outline-variant bg-surface-container-low">
        SEARCH
      </div>
      <div class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/40">search</span>
        <div class="space-y-1">
          <p class="text-xs font-semibold text-on-surface">Search Workspace</p>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">Full text search is coming soon...</p>
        </div>
      </div>
    </template>

    <!-- ===== AI SHORTCUT ===== -->
    <template v-else-if="uiStore.activeView === 'ai'">
      <div class="h-10 flex items-center px-4 shrink-0 text-[11px] font-bold tracking-wider text-on-surface-variant border-b border-outline-variant bg-surface-container-low">
        AI ASSISTANT
      </div>
      <div class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/40">smart_toy</span>
        <div class="space-y-1">
          <p class="text-xs font-semibold text-on-surface">AI Sidebar Shortcut</p>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">The active AI Companion panel resides on the right side.</p>
        </div>
      </div>
    </template>

    <!-- ===== SETTINGS ===== -->
    <template v-else-if="uiStore.activeView === 'settings'">
      <div class="h-10 flex items-center px-4 shrink-0 text-[11px] font-bold tracking-wider text-on-surface-variant border-b border-outline-variant bg-surface-container-low">
        SETTINGS
      </div>
      <div class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/40">settings</span>
        <div class="space-y-1">
          <p class="text-xs font-semibold text-on-surface">Settings</p>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">Preferences config will be added here.</p>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
:deep(.btn-change button) {
  background: transparent;
  color: var(--color-on-surface-variant);
  border: 1px solid var(--color-outline-variant);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s ease-in-out;
}
:deep(.btn-change button:hover) {
  background: var(--color-surface-variant);
  color: var(--color-on-surface);
  border-color: var(--color-outline);
}

:deep(.btn-open-primary button) {
  background: var(--color-primary);
  color: var(--color-background);
  border: 1px solid var(--color-outline-variant);
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}
:deep(.btn-open-primary button:hover) {
  background: #ffffff;
}
</style>