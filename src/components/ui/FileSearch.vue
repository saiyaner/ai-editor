<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useFileSearchStore } from "@/app/stores/fileSearch";
import { useExplorerStore } from "@/app/stores/explorer";
import { useEditorStore } from "@/app/stores/editor";
import { readFile } from "@/services/explorer";
import { detectLanguage } from "@/services/language";

const store = useFileSearchStore();
const explorerStore = useExplorerStore();
const editorStore = useEditorStore();
const inputRef = ref<HTMLInputElement | null>(null);
const keyword = ref("");

const filtered = computed(() => {
  const q = keyword.value.toLowerCase().trim();
  if (!q) return store.files.slice(0, 50); // show first 50 if no query
  return store.files
    .filter((f) => f.toLowerCase().includes(q))
    .slice(0, 50);
});

function getFileName(path: string) {
  const parts = path.split(/[\/\\]/);
  return parts[parts.length - 1];
}

function getDirectory(path: string) {
  const parts = path.split(/[\/\\]/);
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
}

async function openFile(relativePath: string) {
  if (!explorerStore.rootPath) return;
  const fullPath = `${explorerStore.rootPath}/${relativePath}`;
  try {
    const content = await readFile(fullPath);
    const name = getFileName(relativePath);
    const language = detectLanguage(name);
    editorStore.openFile({
      id: fullPath,
      name,
      content,
      language,
      dirty: false,
    });
    store.close();
    keyword.value = "";
  } catch (err) {
    console.error("Failed to open file:", err);
  }
}

function close() {
  store.close();
  keyword.value = "";
}

// Auto-focus input when palette opens
import { watch } from "vue";
watch(() => store.visible, async (val) => {
  if (val) {
    keyword.value = "";
    await nextTick();
    inputRef.value?.focus();
  }
});
</script>

<template>
  <Teleport to="body">
    <div v-if="store.visible" class="fs-overlay" @click.self="close">
      <div class="fs-box">
        <!-- Search input -->
        <div class="fs-input-row">
          <span class="fs-icon">🔍</span>
          <input
            ref="inputRef"
            v-model="keyword"
            class="fs-input"
            placeholder="Search file by name..."
            @keydown.esc="close"
          />
          <span class="fs-hint">ESC to close</span>
        </div>

        <!-- Results -->
        <div class="fs-results">
          <div
            v-if="filtered.length === 0"
            class="fs-empty"
          >
            No files found
          </div>
          <div
            v-for="file in filtered"
            :key="file"
            class="fs-item"
            @click="openFile(file)"
          >
            <span class="fs-filename">{{ getFileName(file) }}</span>
            <span class="fs-dir">{{ getDirectory(file) }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="fs-footer">
          <span>{{ store.files.length }} files indexed</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fs-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  padding-top: 80px;
  z-index: 9999;
}

.fs-box {
  width: 640px;
  max-height: 480px;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
}

/* Input Row */
.fs-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #30363d;
  background: #161b22;
}

.fs-icon {
  font-size: 15px;
  opacity: 0.6;
  flex-shrink: 0;
}

.fs-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e6edf3;
  font-size: 14px;
  font-family: inherit;
}

.fs-input::placeholder {
  color: #8b949e;
}

.fs-hint {
  font-size: 11px;
  color: #8b949e;
  flex-shrink: 0;
}

/* Results */
.fs-results {
  flex: 1;
  overflow-y: auto;
}

.fs-results::-webkit-scrollbar { width: 6px; }
.fs-results::-webkit-scrollbar-track { background: transparent; }
.fs-results::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }

.fs-empty {
  padding: 32px;
  text-align: center;
  color: #8b949e;
  font-size: 13px;
}

.fs-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
  gap: 12px;
}

.fs-item:hover {
  background: #21262d;
}

.fs-filename {
  font-size: 13px;
  color: #e6edf3;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.fs-dir {
  font-size: 11px;
  color: #8b949e;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: right;
}

/* Footer */
.fs-footer {
  padding: 6px 16px;
  border-top: 1px solid #30363d;
  background: #0d1117;
  font-size: 11px;
  color: #8b949e;
}
</style>