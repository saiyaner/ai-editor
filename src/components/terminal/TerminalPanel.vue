<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useTerminalStore } from "@/app/stores/terminal";

const terminal = useTerminalStore();
const command = ref("");

async function execute() {
  if (!command.value) return;
  const cmd = command.value;
  command.value = "";
  await terminal.execute(cmd);
}

function clearLogs() {
  terminal.clear();
}

onMounted(() => {
  if (terminal.logs.length === 0) {
    terminal.append("Nordic terminal workspace initialized.");
  }
});
</script>

<template>
  <div class="h-[220px] shrink-0 flex flex-col bg-surface border-t border-outline-variant text-on-surface font-code select-none">
    
    <!-- Header/Tab Bar -->
    <div class="h-8 shrink-0 flex items-center justify-between px-4 bg-surface-container-lowest border-b border-outline-variant">
      <div class="flex items-center">
        <span class="text-[10px] font-bold tracking-wider text-primary border-b-2 border-primary py-1 inline-block">TERMINAL</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="text-[10px] font-bold uppercase hover:bg-surface-variant text-on-surface-variant hover:text-on-surface px-2 py-0.5 rounded transition-all flex items-center gap-1 border border-outline-variant" @click="execute" title="Run Command">
          ▶ Run
        </button>
        <button class="text-[10px] font-bold uppercase hover:bg-surface-variant text-on-surface-variant hover:text-on-surface px-2 py-0.5 rounded transition-all flex items-center gap-1 border border-outline-variant" @click="clearLogs" title="Clear Console">
          🧹 Clear
        </button>
      </div>
    </div>

    <!-- Output Logs -->
    <div class="flex-1 p-4 overflow-y-auto text-xs leading-relaxed select-text scrollbar-thin">
      <div
        v-for="(line, index) in terminal.logs"
        :key="index"
        class="whitespace-pre-wrap break-all mb-1 font-code"
      >
        <span class="text-primary font-bold mr-1.5">&gt;</span>{{ line }}
      </div>
    </div>

    <!-- Input Row -->
    <div class="h-9 shrink-0 flex items-center px-4 border-t border-outline-variant bg-surface-container-lowest">
      <span class="text-primary font-bold mr-2 select-none">$</span>
      <input
        v-model="command"
        class="flex-1 bg-transparent border-none text-on-surface text-xs font-code py-1.5 focus:outline-none"
        placeholder="Type terminal command here..."
        spellcheck="false"
        @keydown.enter="execute"
      />
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 5px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: var(--color-outline-variant); border-radius: 3px; }
</style>