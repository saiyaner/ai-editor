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

const getStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case "M": return "status-modified";
    case "??":
    case "U": return "status-untracked";
    case "D": return "status-deleted";
    case "A": return "status-added";
    default: return "status-unknown";
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
  <div class="git-panel">
    <div class="panel-header">
      <span class="panel-title">SOURCE CONTROL</span>
      <button class="refresh-btn" @click="refreshGit" :class="{ spinning: isRefreshing }" title="Refresh Status">
        🔄
      </button>
    </div>

    <!-- Commit Input Area -->
    <div class="commit-box">
      <textarea
        v-model="commitMessage"
        placeholder="Commit message (Ctrl+Enter to commit)"
        rows="2"
        class="commit-input"
        @keydown.ctrl.enter="handleCommit"
      ></textarea>
      <button 
        class="commit-btn" 
        @click="handleCommit"
        :disabled="!commitMessage.trim() || gitStore.files.length === 0"
      >
        Commit
      </button>
    </div>

    <!-- Changes List -->
    <div class="changes-section">
      <div class="section-title">
        <span>CHANGES</span>
        <span class="changes-count">{{ gitStore.files.length }}</span>
      </div>

      <div class="files-list" v-if="gitStore.files.length > 0">
        <div
          v-for="file in gitStore.files"
          :key="file.path"
          class="git-file-item"
          :title="file.path"
        >
          <div class="file-info">
            <span class="file-name">{{ getFileName(file.path) }}</span>
            <span class="file-path">{{ getDirectoryPath(file.path) }}</span>
          </div>
          <span class="status-badge" :class="getStatusClass(file.status)">
            {{ getStatusLabel(file.status) }}
          </span>
        </div>
      </div>
      <div class="empty-changes" v-else>
        No changes detected
      </div>
    </div>
  </div>
</template>

<style scoped>
.git-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #161b22;
  color: #c9d1d9;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #30363d;
  background-color: #0d1117;
}

.panel-title {
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
  color: #8b949e;
}

.refresh-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #21262d;
  color: #c9d1d9;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.commit-box {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid #30363d;
}

.commit-input {
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #c9d1d9;
  padding: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  outline: none;
}

.commit-input:focus {
  border-color: #58a6ff;
}

.commit-btn {
  background-color: #238636;
  color: #ffffff;
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 4px;
  padding: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.commit-btn:hover:not(:disabled) {
  background-color: #2ea043;
}

.commit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #21262d;
  color: #8b949e;
}

.changes-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: bold;
  color: #8b949e;
  border-bottom: 1px solid #21262d;
  background-color: #0d1117;
}

.changes-count {
  background-color: #30363d;
  color: #c9d1d9;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.files-list {
  flex: 1;
  overflow-y: auto;
}

.git-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.git-file-item:hover {
  background-color: #21262d;
}

.file-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 8px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: #c9d1d9;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.file-path {
  font-size: 11px;
  color: #8b949e;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.status-badge {
  font-size: 11px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  flex-shrink: 0;
}

.status-modified {
  color: #d29922;
}

.status-untracked {
  color: #3fb950;
}

.status-deleted {
  color: #f85149;
}

.status-added {
  color: #58a6ff;
}

.status-unknown {
  color: #8b949e;
}

.empty-changes {
  padding: 24px;
  text-align: center;
  color: #8b949e;
  font-size: 13px;
}
</style>