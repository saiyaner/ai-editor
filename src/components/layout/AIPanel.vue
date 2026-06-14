<script setup lang="ts">
import AIChat from "@/components/ai/AIChat.vue";
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden bg-surface-container select-none">
    
    <!-- Header -->
    <div class="h-10 shrink-0 flex items-center justify-between px-4 border-b border-outline-variant bg-surface-container-high">
      <div class="text-[11px] font-bold tracking-wider text-on-surface flex items-center gap-2 uppercase">
        <span class="material-symbols-outlined text-[16px] text-primary">smart_toy</span>
        AI ASSISTANT
      </div>
      <div class="flex items-center gap-2 text-on-surface-variant">
        <button class="hover:text-on-surface transition-colors flex items-center">
          <span class="material-symbols-outlined text-[16px]">history</span>
        </button>
        <button class="hover:text-on-surface transition-colors flex items-center">
          <span class="material-symbols-outlined text-[16px]">more_vert</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <AIChat />
    </div>
  </div>
</template>