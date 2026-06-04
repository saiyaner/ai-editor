import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const activeView = ref("explorer");

  const setActiveView = (view: string) => {
    activeView.value = view;
  };

  return {
    activeView,
    setActiveView,
  };
});