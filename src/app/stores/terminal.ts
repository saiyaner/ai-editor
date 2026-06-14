import { defineStore } from "pinia";
import { ref } from "vue";
import { runCommand } from "@/services/terminal";
import { useExplorerStore } from "./explorer";

export const useTerminalStore =
  defineStore("terminal", () => {

    const logs = ref<string[]>([]);
    const isVisible = ref(true);

    function toggle() {
      isVisible.value = !isVisible.value;
    }


    function append(
      text: string
    ) {
      logs.value.push(text);
    }

    function clear() {
      logs.value = [];
    }

    async function execute(cmd: string) {
      const explorer = useExplorerStore();
      append(`> ${cmd}`);

      if (!explorer.rootPath) {
        append("No workspace opened");
        return;
      }

      try {
        const result = await runCommand(cmd, explorer.rootPath);
        append(result);
      } catch (error: any) {
        append(`Error: ${error}`);
      }
    }

    return {
      logs,
      isVisible,
      toggle,
      append,
      clear,
      execute,
    };
  });