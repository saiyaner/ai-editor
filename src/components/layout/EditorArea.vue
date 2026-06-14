<script setup lang="ts">
import { computed } from "vue";
import EditorTabs from "@/components/editor/EditorTabs.vue";
import MonacoEditor from "@/components/editor/MonacoEditor.vue";
import { useEditorStore } from "@/app/stores/editor";
import { useExplorerStore } from "@/app/stores/explorer";

const editorStore = useEditorStore();
const explorerStore = useExplorerStore();

const breadcrumbs = computed(() => {
  if (!editorStore.currentFile?.path) return [];
  const root = explorerStore.rootPath || "";
  let rel = editorStore.currentFile.path;
  if (rel.startsWith(root)) {
    rel = rel.slice(root.length);
  }
  if (rel.startsWith("/") || rel.startsWith("\\")) {
    rel = rel.slice(1);
  }
  const parts = rel.split(/[\/\\]/).filter(Boolean);
  const rootName = root.split(/[\/\\]/).pop() || "WORKSPACE";
  return [rootName.toUpperCase(), ...parts];
});
</script>

<template>
  <div class="flex-grow flex flex-col min-h-0 overflow-hidden bg-surface">
    <EditorTabs />

    <div class="flex-grow flex flex-col min-h-0 overflow-hidden relative">
      <MonacoEditor v-if="editorStore.currentFile" />
      
      <div v-else class="flex-grow flex flex-col items-center justify-center p-8 text-center select-none text-on-surface-variant gap-4 bg-surface">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/40">bolt</span>
        <div class="space-y-1">
          <p class="text-xs font-semibold text-on-surface">Welcome to Nordic Code Workspace</p>
          <p class="text-[11px] text-on-surface-variant leading-relaxed max-w-[240px]">
            Open a file from the explorer or search using 
            <kbd class="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[9px] font-code mx-1">Ctrl+P</kbd>
          </p>
        </div>
      </div>
    </div>

    <!-- Breadcrumbs -->
    <div v-if="editorStore.currentFile" class="h-6 flex items-center px-4 bg-surface-container-lowest border-t border-outline-variant text-[10px] font-bold tracking-widest text-on-surface-variant shrink-0 select-none uppercase">
      <template v-for="(part, i) in breadcrumbs" :key="i">
        <span :class="[i === breadcrumbs.length - 1 ? 'text-on-surface' : '']">{{ part }}</span>
        <span v-if="i < breadcrumbs.length - 1" class="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
      </template>
    </div>
  </div>
</template>