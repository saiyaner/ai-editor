import { defineStore } from "pinia";

export const useFileSearchStore = defineStore(
  "fileSearch",
  {
    state: () => ({
      visible: false,
      files: [] as string[],
    }),

    actions: {
      open() {
        this.visible = true;
      },

      close() {
        this.visible = false;
      },

      setFiles(files: string[]) {
        this.files = files;
      },
    },
  }
);