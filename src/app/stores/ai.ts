import { defineStore } from "pinia";
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  mentionedFiles?: { name: string; path: string }[];
}

export const useAIStore = defineStore("ai", () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const selectedModel = ref("qwen2.5-coder:3b");
  const autocompleteEnabled = ref(true);
  const availableModels = ref<string[]>(["qwen2.5-coder:3b", "deepseek-coder:1.3b"]);

  function addMessage(
    role: "user" | "assistant",
    content: string,
    images?: string[],
    mentionedFiles?: { name: string; path: string }[]
  ) {
    messages.value.push({
      id: crypto.randomUUID(),
      role,
      content,
      images,
      mentionedFiles,
    });
  }

  function appendToLastMessage(text: string) {
    if (messages.value.length > 0) {
      messages.value[messages.value.length - 1].content += text;
    }
  }

  function clearMessages() {
    messages.value = [];
  }

  function setLoading(value: boolean) {
    loading.value = value;
  }

  async function loadModels() {
    try {
      const models = await invoke<string[]>("get_models");
      if (models && models.length > 0) {
        availableModels.value = models;
        if (!models.includes(selectedModel.value)) {
          selectedModel.value = models[0];
        }
      }
    } catch (e) {
      console.error("Failed to load models:", e);
    }
  }

  return {
    messages,
    loading,
    selectedModel,
    autocompleteEnabled,
    availableModels,
    addMessage,
    appendToLastMessage,
    clearMessages,
    setLoading,
    loadModels,
  };
});