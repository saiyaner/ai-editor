<script setup lang="ts">
import { ref } from "vue";
import { useGitStore } from "@/app/stores/git";
import { useExplorerStore } from "@/app/stores/explorer";
import { getStatus } from "@/services/git";

const gitStore = useGitStore();
const explorerStore = useExplorerStore();
const commitMessage = ref("");
const isRefreshing = ref(false);

const getFileName = (path: string) => {
  const parts = path.split(/[\/\\]/);
  return parts[parts.length - 1] || path;
};

const getDirectoryPath = (path: string) => {
  const parts = path.split(/[\/\\]/);
  if (parts.length <= 1) return "";
  return parts.slice(0, parts.length - 1).join("/");
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "M": return "text-[#d29922]";
    case "??":
    case "U": return "text-[#3fb950]";
    case "D": return "text-error";
    case "A": return "text-[#58a6ff]";
    default: return "text-on-surface-variant";
  }
};

const getStatusLabel = (status: string) => {
  if (status === "??") return "U";
  return status;
};

async function refreshGit() {
  if (!explorerStore.rootPath) return;
  isRefreshing.value = true;
  try {
    const status = await getStatus(explorerStore.rootPath);
    gitStore.setFiles(status);
  } catch (err) {
    console.error(err);
  } finally {
    isRefreshing.value = false;
  }
}

async function handleCommit() {
  if (!commitMessage.value.trim()) return;
  alert(`Committed: "${commitMessage.value}"`);
  commitMessage.value = "";
  await refreshGit();
}
</script>

<template>
  <div class="flex flex-col h-full bg-surface-container-low text-on-surface overflow-hidden select-none">
    
    <!-- Header -->
    <div class="h-10 shrink-0 flex items-center justify-between px-4 border-b border-outline-variant bg-surface-container-high">
      <span class="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">SOURCE CONTROL</span>
      <button 
        class="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-variant transition-colors flex items-center"
        @click="refreshGit" 
        :class="{ 'animate-spin': isRefreshing }"
        title="Refresh Status"
      >
        <span class="material-symbols-outlined text-[16px]">refresh</span>
      </button>
    </div>

    <!-- Commit Input Area -->
    <div class="p-4 flex flex-col gap-2 border-b border-outline-variant bg-surface-container-low">
      <textarea
        v-model="commitMessage"
        placeholder="Commit message (Ctrl+Enter to commit)"
        rows="2"
        class="w-full bg-surface border border-outline-variant rounded p-3 text-xs font-code text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none resize-none transition-colors"
        @keydown.ctrl.enter="handleCommit"
      ></textarea>
      
      <button 
        class="w-full bg-primary hover:bg-white text-background text-[11px] font-bold py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors uppercase" 
        @click="handleCommit"
        :disabled="!commitMessage.trim() || gitStore.files.length === 0"
      >
        <span>COMMIT</span>
        <span class="material-symbols-outlined text-[14px]">send</span>
      </button>
    </div>

    <!-- Changes List -->
    <div class="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest">
      <div class="flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-on-surface-variant border-b border-outline-variant bg-surface-container">
        <span>CHANGES</span>
        <span class="bg-surface-variant text-on-surface px-2 py-0.5 rounded text-[10px] font-code">{{ gitStore.files.length }}</span>
      </div>

      <div class="flex-1 overflow-y-auto" v-if="gitStore.files.length > 0">
        <div
          v-for="file in gitStore.files"
          :key="file.path"
          class="flex items-center justify-between px-4 py-2.5 hover:bg-surface-variant cursor-pointer border-b border-outline-variant/50 transition-colors"
          :title="file.path"
        >
          <div class="flex flex-col min-w-0 mr-2">
            <span class="text-xs font-semibold text-on-surface truncate">{{ getFileName(file.path) }}</span>
            <span class="text-[10px] text-on-surface-variant truncate font-code mt-0.5">{{ getDirectoryPath(file.path) || './' }}</span>
          </div>
          <span class="text-xs font-bold font-code shrink-0" :class="getStatusColor(file.status)">
            {{ getStatusLabel(file.status) }}
          </span>
        </div>
      </div>
      
      <div class="flex-1 flex items-center justify-center p-6 text-center text-xs text-on-surface-variant/50" v-else>
        No staged or unstaged changes
      </div>
    </div>
  </div>
</template>