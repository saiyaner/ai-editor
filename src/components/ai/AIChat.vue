<script setup lang="ts">
import { ref, nextTick } from "vue";
import MarkdownIt from "markdown-it";

import { askAI } from "@/services/ai";
import { useAIStore } from "@/app/stores/ai";
import { useEditorStore } from "@/app/stores/editor";

const ai = useAIStore();
const editor = useEditorStore();

const input = ref("");

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});

function renderMarkdown(text: string) {
  return md.render(text);
}

async function fixCode() {
  const code =
    editor.currentFile
      ?.selectedCode;

  if (!code) return;

  ai.addMessage(
    "user",
    "Fix selected code"
  );

  ai.setLoading(true);

  try {
    const response =
      await askAI(`
Fix this code:

${code}
`);

    ai.addMessage(
      "assistant",
      String(response)
    );
  } finally {
    ai.setLoading(false);
  }
}

async function scrollToBottom() {
  await nextTick();

  const el = document.querySelector(".messages");

  if (el) {
    el.scrollTop = el.scrollHeight;
  }
}

async function send() {
  if (!input.value.trim()) return;

  const prompt = input.value;

  ai.addMessage("user", prompt);

  input.value = "";

  await scrollToBottom();

  ai.setLoading(true);

  try {
    const response = await askAI(prompt);

    ai.addMessage(
      "assistant",
      String(response)
    );

    await scrollToBottom();
  } catch (error) {
    console.error(error);

    ai.addMessage(
      "assistant",
      "❌ Failed to get AI response."
    );
  } finally {
    ai.setLoading(false);
  }
}

async function explainSelection() {
  const selectedCode =
    editor.currentFile?.selectedCode;

  if (!selectedCode) {
    ai.addMessage(
      "assistant",
      "Please select code first."
    );
    return;
  }

  ai.addMessage(
    "user",
    "Explain selected code"
  );

  ai.setLoading(true);

  try {
    const response = await askAI(`
Explain this code:

${selectedCode}
`);

    ai.addMessage(
      "assistant",
      String(response)
    );

    await scrollToBottom();
  } catch (error) {
    console.error(error);

    ai.addMessage(
      "assistant",
      "❌ Failed to explain code."
    );
  } finally {
    ai.setLoading(false);
  }
}
</script>

<template>
  <div class="chat-wrapper">
    <div class="messages">

      <div
        v-if="!ai.messages.length"
        class="empty-state"
      >
        Ask AI anything 🚀
      </div>

      <div
        v-for="message in ai.messages"
        :key="message.id"
        :class="[
          'message',
          message.role
        ]"
      >
        <div class="role">
          {{ message.role }}
        </div>

        <div
          class="content"
          v-html="
            renderMarkdown(
              message.content
            )
          "
        />
      </div>

      <div
        v-if="ai.loading"
        class="loading"
      >
        🤖 Thinking...
      </div>

    </div>

    <div class="actions">

      <button
        @click="explainSelection"
      >
        Explain
      </button>

      <button
        @click="fixCode"
      >
        Fix
      </button>

    </div>

    <div class="chat-input">
      <input
        v-model="input"
        @keydown.enter="send"
        placeholder="Ask AI..."
      />

      <button @click="send">
        Send
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  opacity: 0.5;
  text-align: center;
  margin-top: 24px;
}

.message {
  margin-bottom: 16px;
}

.role {
  font-size: 11px;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 6px;
}

.content {
  padding: 12px;
  border-radius: 8px;
  line-height: 1.6;
  word-break: break-word;
}

.user .content {
  background: #1e293b;
}

.assistant .content {
  background: #111827;
}

.loading {
  opacity: 0.7;
  padding: 8px;
}

.actions {
  padding: 10px;
  border-top: 1px solid #1e293b;
}

.actions button {
  width: 100%;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #1e293b;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: white;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 10px;
}

.actions button {
  flex: 1;
}
</style>