<script setup lang="ts">
import { useUiStore } from "@/app/stores/ui";

const uiStore = useUiStore();
</script>

<template>
  <div class="w-12 h-full flex flex-col justify-between items-center bg-surface-container-low border-r border-outline-variant py-4 select-none shrink-0 z-40">
    <div class="flex flex-col gap-6 w-full">
      <!-- Explorer -->
      <button
        :class="[
          uiStore.activeView === 'explorer'
            ? 'text-on-surface'
            : 'text-on-surface-variant hover:text-on-surface'
        ]"
        class="w-full flex justify-center relative transition-colors group cursor-pointer"
        @click="uiStore.setActiveView('explorer')"
        title="Explorer"
      >
        <div v-if="uiStore.activeView === 'explorer'" class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-primary"></div>
        <span class="material-symbols-outlined text-[22px]">folder_open</span>
      </button>

      <!-- Git / Source Control -->
      <button
        :class="[
          uiStore.activeView === 'git'
            ? 'text-on-surface'
            : 'text-on-surface-variant hover:text-on-surface'
        ]"
        class="w-full flex justify-center relative transition-colors group cursor-pointer"
        @click="uiStore.setActiveView('git')"
        title="Source Control"
      >
        <div v-if="uiStore.activeView === 'git'" class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-primary"></div>
        <span class="material-symbols-outlined text-[22px]">account_tree</span>
      </button>

      <!-- Search -->
      <button
        :class="[
          uiStore.activeView === 'search'
            ? 'text-on-surface'
            : 'text-on-surface-variant hover:text-on-surface'
        ]"
        class="w-full flex justify-center relative transition-colors group cursor-pointer"
        @click="uiStore.setActiveView('search')"
        title="Search"
      >
        <div v-if="uiStore.activeView === 'search'" class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-primary"></div>
        <span class="material-symbols-outlined text-[22px]">search</span>
      </button>

      <!-- AI Chat -->
      <button
        :class="[
          uiStore.activeView === 'ai'
            ? 'text-on-surface'
            : 'text-on-surface-variant hover:text-on-surface'
        ]"
        class="w-full flex justify-center relative transition-colors group cursor-pointer"
        @click="uiStore.setActiveView('ai')"
        title="AI Assistant"
      >
        <div v-if="uiStore.activeView === 'ai'" class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-primary"></div>
        <span class="material-symbols-outlined text-[22px]">smart_toy</span>
      </button>
    </div>

    <!-- Settings -->
    <div class="flex flex-col gap-6 w-full">
      <button
        :class="[
          uiStore.activeView === 'settings'
            ? 'text-on-surface'
            : 'text-on-surface-variant hover:text-on-surface'
        ]"
        class="w-full flex justify-center relative transition-colors group cursor-pointer"
        @click="uiStore.setActiveView('settings')"
        title="Settings"
      >
        <div v-if="uiStore.activeView === 'settings'" class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-primary"></div>
        <span class="material-symbols-outlined text-[22px]">settings</span>
      </button>
    </div>
  </div>
</template>