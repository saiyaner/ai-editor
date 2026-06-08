<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useTerminalStore } from "@/app/stores/terminal";
import { runCommand } from "@/services/terminal";
import { useExplorerStore } from "@/app/stores/explorer";

const terminal =
  useTerminalStore();

const command =
  ref("");

const explorer =
  useExplorerStore();

async function execute() {
  if (!command.value)
    return;

  terminal.append(
    `> ${command.value}`
  );

  if (!explorer.rootPath) {
    terminal.append(
      "No workspace opened"
    );
    return;
  }

  try {
    const result = await runCommand(
      command.value,
      explorer.rootPath
    );
    terminal.append(result);
  } catch (error: any) {
    terminal.append(`Error: ${error}`);
  }

  command.value = "";
}

function clearLogs() {
  terminal.clear();
}

onMounted(() => {
  if (terminal.logs.length === 0) {
    terminal.append("Terminal ready to use.");
  }
});
</script>

<template>
  <div class="terminal-panel">
    <!-- Header/Tab Bar -->
    <div class="terminal-header">
      <div class="terminal-tabs">
        <span class="terminal-tab active">TERMINAL</span>
      </div>
      <div class="terminal-actions">
        <button class="action-btn" @click="execute" title="Run Command">▶ Run</button>
        <button class="action-btn" @click="clearLogs" title="Clear Console">🧹 Clear</button>
      </div>
    </div>

    <!-- Output Logs -->
    <div class="terminal-body">
      <div
        v-for="(line, index) in terminal.logs"
        :key="index"
        class="terminal-line"
      >
        <span class="prompt-symbol">&gt;</span> {{ line }}
      </div>
    </div>

    <div class="terminal-input">
      <span class="prompt-symbol">$</span>

      <input
        v-model="command"
        class="command-input"
        placeholder="Type your command..."
        spellcheck="false"
        @keydown.enter="execute"
      />
    </div>
  </div>
</template>

<style scoped>
.terminal-panel {
  height: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: #0d1117;
  border-top: 1px solid #30363d;
  color: #c9d1d9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #161b22;
  padding: 4px 16px;
  border-bottom: 1px solid #30363d;
}

.terminal-tab {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #58a6ff;
  border-bottom: 1.5px solid #58a6ff;
  padding: 4px 0;
  display: inline-block;
}

.terminal-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #8b949e;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease-in-out;
}

.action-btn:hover {
  background-color: #21262d;
  color: #c9d1d9;
  border-color: #30363d;
}

.terminal-body {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
}

.terminal-line {
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 4px;
}

.prompt-symbol {
  color: #238636;
  font-weight: bold;
  margin-right: 6px;
  user-select: none;
}

.terminal-input {
  display: flex;

  align-items: center;

  padding: 8px 12px;

  border-top: 1px solid #30363d;
  background: #0d1117;
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 8px;
}
</style>