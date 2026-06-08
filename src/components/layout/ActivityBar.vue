<script setup lang="ts">
import { useUiStore } from "@/app/stores/ui";

const uiStore = useUiStore();
</script>

<template>
  <div class="activity-bar">
    <div class="top-items">
      <button
        :class="{ active: uiStore.activeView === 'explorer' }"
        @click="uiStore.setActiveView('explorer')"
        title="Explorer"
      >
        📁
      </button>

      <button
        :class="{ active: uiStore.activeView === 'git' }"
        @click="uiStore.setActiveView('git')"
        title="Source Control (Git)"
      >
        🌿
      </button>

      <button
        :class="{ active: uiStore.activeView === 'search' }"
        @click="uiStore.setActiveView('search')"
        title="Search"
      >
        🔍
      </button>

      <button
        :class="{ active: uiStore.activeView === 'ai' }"
        @click="uiStore.setActiveView('ai')"
        title="AI Assistant"
      >
        🤖
      </button>
    </div>

    <div class="bottom-items">
      <button
        :class="{ active: uiStore.activeView === 'settings' }"
        @click="uiStore.setActiveView('settings')"
        title="Settings"
      >
        ⚙
      </button>
    </div>
  </div>
</template>

<style scoped>
.activity-bar {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #0d1117;
  border-right: 1px solid #30363d;
  padding: 8px 0;
  user-select: none;
}

.top-items, .bottom-items {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

button {
  width: 100%;
  height: 48px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0.6;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

button:hover {
  opacity: 0.9;
  background-color: #21262d;
}

button.active {
  opacity: 1;
}

button.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  width: 3px;
  background-color: #58a6ff;
  border-radius: 0 4px 4px 0;
}
</style>