<script setup lang="ts">
import Header from "@/components/layout/Header.vue";

import ActivityBar from "@/components/layout/ActivityBar.vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import EditorArea from "@/components/layout/EditorArea.vue";
import AIPanel from "@/components/layout/AIPanel.vue";
import StatusBar from "@/components/layout/StatusBar.vue";
import { useLayoutStore } from "@/app/stores/layout";

const layoutStore = useLayoutStore();
const startResize = () => {
  document.addEventListener("mousemove", resizeSidebar);
  document.addEventListener("mouseup", stopResize);
};

const resizeSidebar = (event: MouseEvent) => {
  layoutStore.setSidebarWidth(
    Math.max(180, event.clientX)
  );
};

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
      </main>

      <aside class="ai-container">
        <AIPanel />
      </aside>

    </div>

    <StatusBar />

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