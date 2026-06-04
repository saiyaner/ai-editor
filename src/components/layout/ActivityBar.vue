<script setup lang="ts">
import { useUiStore } from "@/app/stores/ui";

const uiStore = useUiStore();
</script>

<template>
  <div class="activity-bar">

    <button
      @click="uiStore.setActiveView('explorer')"
    >
      📁
    </button>

    <button
      @click="uiStore.setActiveView('search')"
    >
      🔍
    </button>

    <button
      @click="uiStore.setActiveView('ai')"
    >
      🤖
    </button>

    <button
      @click="uiStore.setActiveView('settings')"
    >
      ⚙
    </button>

  </div>
</template>

<style scoped>
.activity-bar {
  width: 60px;

  display: flex;
  flex-direction: column;
  align-items: center;

  border-right: 1px solid #333;
}

button {
  width: 100%;
  height: 50px;

  border: none;
  background: transparent;

  cursor: pointer;
  font-size: 20px;
}
</style>