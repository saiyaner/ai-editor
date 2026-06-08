<script setup lang="ts">
import Header from "@/components/layout/Header.vue";

import ActivityBar from "@/components/layout/ActivityBar.vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import EditorArea from "@/components/layout/EditorArea.vue";
import AIPanel from "@/components/layout/AIPanel.vue";
import StatusBar from "@/components/layout/StatusBar.vue";
import { useLayoutStore } from "@/app/stores/layout";
import { useEditorStore } from "@/app/stores/editor";
import { useUiStore } from "@/app/stores/ui";
import { saveFile } from "@/services/save";
import TerminalPanel from "@/components/terminal/TerminalPanel.vue";
import { useCommandStore } from "@/app/stores/command";
import CommandPalette from "@/components/ui/CommandPalette.vue";
import { onMounted, onUnmounted } from "vue";
import FileSearch from "@/components/ui/FileSearch.vue";
import { useFileSearchStore } from "@/app/stores/fileSearch";
import { useExplorerStore } from "@/app/stores/explorer";
import { flattenTree } from "@/services/fileSearch";

const editorStore = useEditorStore();
const layoutStore = useLayoutStore();
const uiStore = useUiStore();
const commands = useCommandStore();
const fileSearch = useFileSearchStore();
const explorerStore = useExplorerStore();

onMounted(async () => {
  commands.setCommands([
    {
      id: "save",
      title: "File: Save File",
      action: () => saveCurrent(),
    },
    {
      id: "explorer",
      title: "View: Explorer",
      action: () => uiStore.setActiveView("explorer"),
    },
    {
      id: "git",
      title: "View: Source Control",
      action: () => uiStore.setActiveView("git"),
    },
    {
      id: "search",
      title: "View: Search",
      action: () => uiStore.setActiveView("search"),
    },
    {
      id: "ai",
      title: "View: AI Assistant",
      action: () => uiStore.setActiveView("ai"),
    },
  ]);

  window.addEventListener("keydown", handleGlobalKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKey);
});

async function saveCurrent() {
  const file = editorStore.currentFile;
  if (!file) return;

  try {
    await saveFile(file.id, file.content);
    editorStore.markSaved(file.id);
  } catch (error) {
    console.error("Failed to save file:", error);
  }
}
const startResize = () => {
  document.addEventListener("mousemove", resizeSidebar);
  document.addEventListener("mouseup", stopResize);
};

const resizeSidebar = (event: MouseEvent) => {
  layoutStore.setSidebarWidth(
    Math.max(180, event.clientX)
  );
};

async function handleGlobalKey(e: KeyboardEvent) {
  // Ctrl+S  → Save
  if (e.ctrlKey && !e.shiftKey && e.key === "s") {
    e.preventDefault();
    await saveCurrent();
  }
  // Ctrl+Shift+P → Command Palette
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
    e.preventDefault();
    commands.open();
  }
  // Ctrl + P → File Search (quick open)
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "p") {
    e.preventDefault();
    // Populate files from the current explorer tree
    if (explorerStore.rootPath && explorerStore.tree.length > 0) {
      const files = flattenTree(explorerStore.tree, explorerStore.rootPath);
      fileSearch.setFiles(files);
    }
    fileSearch.open();
  }
}

const stopResize = () => {
  document.removeEventListener(
    "mousemove",
    resizeSidebar
  );

  document.removeEventListener(
    "mouseup",
    stopResize
  );
};
</script>

<template>
  <div class="app">

    <Header />

    <div class="workspace">

      <ActivityBar />

      <aside class="sidebar-container" :style="{ width: `${layoutStore.sidebarWidth}px` }">
        <Sidebar />
      </aside>

      <div class="resize-handle" @mousedown="startResize"></div>

      <main class="editor-container">
        <EditorArea />
        <TerminalPanel />
      </main>

      <aside class="ai-container">
        <AIPanel />
      </aside>

    </div>

    <StatusBar />

    <!-- File Search -->
    <FileSearch />
    <!-- Command Palette (global overlay) -->
    <CommandPalette />

  </div>
</template>

<style scoped>
.app {
  height: 100vh;

  display: flex;
  flex-direction: column;
}

.workspace {
  flex: 1;

  display: flex;
}

.sidebar-container {
  width: 250px;
  border-right: 1px solid #333;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.ai-container {
  width: 350px;
  border-left: 1px solid #333;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
}
</style>