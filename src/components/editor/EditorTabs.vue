<script setup lang="ts">
import { useEditorStore } from "@/app/stores/editor";
import { getFileIconUrl } from "@/services/fileIcons";

const editorStore = useEditorStore();
</script>

<template>
  <div class="flex h-9 bg-surface-container-lowest border-b border-outline-variant shrink-0 overflow-x-auto no-scrollbar select-none">
    <div
      v-for="file in editorStore.files"
      :key="file.id"
      :class="[
        file.id === editorStore.currentFile?.id
          ? 'bg-surface border-t-2 border-t-primary text-on-surface border-r border-outline-variant'
          : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border-r border-outline-variant'
      ]"
      class="flex items-center gap-1.5 px-3 h-full text-xs font-mono cursor-pointer min-w-fit transition-colors"
      @click="editorStore.currentFile = file"
    >
      <!-- Real file SVG icon from material-icon-theme -->
      <img
        :src="getFileIconUrl(file.name, false)"
        :alt="file.name"
        class="w-4 h-4 shrink-0 object-contain"
      />
      <span>{{ file.name }}</span>
      
      <!-- Dirty dot / Close Button -->
      <span v-if="file.dirty" class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-1.5 shrink-0"></span>
      <button 
        v-else 
        class="w-3.5 h-3.5 ml-1 flex items-center justify-center text-[12px] font-sans text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-variant rounded transition-all cursor-pointer border-none bg-transparent"
        @click.stop="editorStore.closeFile(file.id)"
        title="Close Tab"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>