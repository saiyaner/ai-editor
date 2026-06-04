import { defineStore } from "pinia";
import { ref } from "vue";

export const useLayoutStore = defineStore("layout", () => {
  const sidebarWidth = ref(250);

  const setSidebarWidth = (width: number) => {
    sidebarWidth.value = width;
  };

  return {
    sidebarWidth,
    setSidebarWidth,
  };
});