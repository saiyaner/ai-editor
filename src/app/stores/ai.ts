import { defineStore } from "pinia";
import { ref } from "vue";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const useAIStore = defineStore("ai", () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);

  function addMessage(
    role: "user" | "assistant",
    content: string
  ) {
    messages.value.push({
      id: crypto.randomUUID(),
      role,
      content,
    });
  }

  function clearMessages() {
    messages.value = [];
  }

  function setLoading(value: boolean) {
    loading.value = value;
  }

  return {
    messages,
    loading,
    addMessage,
    clearMessages,
    setLoading,
  };
});