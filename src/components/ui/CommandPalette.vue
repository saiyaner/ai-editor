<script setup lang="ts">
import { ref, computed } from "vue";
import { useCommandStore } from "@/app/stores/command";

const store = useCommandStore();

const search = ref("");

const filtered = computed(() =>
  store.commands.filter((c) =>
    c.title.toLowerCase().includes(
      search.value.toLowerCase()
    )
  )
);

function execute(command: any) {
  command.action();
  store.close();
}
</script>

<template>
  <div
    v-if="store.visible"
    class="command-overlay"
  >
    <div class="command-box">

      <input
        v-model="search"
        placeholder="Type a command..."
      />

      <div
        v-for="command in filtered"
        :key="command.id"
        class="command-item"
        @click="execute(command)"
      >
        {{ command.title }}
      </div>

    </div>
  </div>
</template>

<style>
.command-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0,0,0,.4);

  display: flex;

  justify-content: center;

  align-items: start;

  padding-top: 80px;

  z-index: 9999;
}

.command-box {
  width: 600px;

  background: #1e1e1e;

  border: 1px solid #333;

  border-radius: 8px;

  overflow: hidden;
}

.command-box input {
  width: 100%;

  padding: 12px;

  border: none;

  outline: none;

  background: #252526;

  color: white;
}

.command-item {
  padding: 10px 12px;

  cursor: pointer;
}

.command-item:hover {
  background: #2d2d30;
}
</style>