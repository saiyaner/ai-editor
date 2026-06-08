import { defineStore } from "pinia";
import { ref } from "vue";

export const useTerminalStore =
  defineStore("terminal", () => {

    const logs = ref<string[]>([]);

    function append(
      text: string
    ) {
      logs.value.push(text);
    }

    function clear() {
      logs.value = [];
    }

    return {
      logs,
      append,
      clear,
    };
  });