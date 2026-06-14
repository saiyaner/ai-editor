<script setup lang="ts">


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
import { useTerminalStore } from "@/app/stores/terminal";
import { formatCode, isSupportedLanguage } from "@/services/formatter";



const editorStore = useEditorStore();
const layoutStore = useLayoutStore();
const uiStore = useUiStore();
const commands = useCommandStore();
const fileSearch = useFileSearchStore();
const explorerStore = useExplorerStore();
const terminalStore = useTerminalStore();


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
    {
      id: "format",
      title: "Format Document (Prettier)  —  Ctrl+Shift+F",
      action: async () => {
        const file = editorStore.currentFile;
        if (!file || !isSupportedLanguage(file.language)) return;
        try {
          const formatted = await formatCode(file.content, file.language);
          editorStore.updateContent(formatted);
        } catch (e) {
          console.warn("Format error:", e);
        }
      },
    },
    {
      id: "toggle-terminal",
      title: "View: Toggle Terminal  —  Ctrl+T",
      action: () => terminalStore.toggle(),
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
  // Ctrl + T → Toggle Terminal
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "`") {
    e.preventDefault();
    terminalStore.toggle();
  }
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "t") {
    e.preventDefault();
    terminalStore.toggle();
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

    <div class="workspace">

      <ActivityBar />

      <aside class="sidebar-container" :style="{ width: `${layoutStore.sidebarWidth}px` }">
        <Sidebar />
      </aside>

      <div class="resize-handle" @mousedown="startResize"></div>

      <main class="editor-container">
        <EditorArea />
        <TerminalPanel v-show="terminalStore.isVisible" />
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
/* ── Root app shell ────────────────────────────────────────────────── */
.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;        /* full viewport, respects mobile chrome */
  overflow: hidden;
}

/* ── Workspace row (between header and status bar) ─────────────────── */
.workspace {
  flex: 1;
  display: flex;
  min-height: 0;         /* critical: lets children shrink below content size */
  overflow: hidden;
}

/* ── Sidebar container (resizable) ─────────────────────────────────── */
.sidebar-container {
  display: flex;
  flex-direction: column;
  min-width: 180px;
  max-width: 600px;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--color-outline-variant);
  flex-shrink: 0;
}

/* ── Resize drag handle ─────────────────────────────────────────────── */
.resize-handle {
  width: 4px;
  flex-shrink: 0;
  cursor: col-resize;
  background: transparent;
  transition: background 0.15s;
}
.resize-handle:hover { background: var(--color-primary); }

/* ── Center column: editor + terminal stacked ──────────────────────── */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;          /* allow shrinking when sidebar/ai expands */
  min-height: 0;
  overflow: hidden;
}

/* ── AI chat sidebar ────────────────────────────────────────────────── */
.ai-container {
  display: flex;
  flex-direction: column;
  width: 340px;
  min-width: 260px;
  max-width: 520px;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid var(--color-outline-variant);
  flex-shrink: 0;
}
</style>