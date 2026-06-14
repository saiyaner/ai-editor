import { defineStore } from "pinia";

export interface CommandItem {
  id: string;
  title: string;
  action: () => void;
}

export const useCommandStore = defineStore("command", {
  state: () => ({
    visible: false,
    commands: [] as CommandItem[],
  }),

  actions: {
    open() {
      this.visible = true;
    },

    close() {
      this.visible = false;
    },

    setCommands(commands: CommandItem[]) {
      this.commands = commands;
    },
  },
});