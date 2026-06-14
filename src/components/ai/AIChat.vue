<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import MarkdownIt from "markdown-it";

import { askAI } from "@/services/ai";
import { useAIStore } from "@/app/stores/ai";
import { useEditorStore } from "@/app/stores/editor";
import { useFileSearchStore } from "@/app/stores/fileSearch";
import { useExplorerStore } from "@/app/stores/explorer";
import { useTerminalStore } from "@/app/stores/terminal";
import { readFile } from "@/services/explorer";

const ai = useAIStore();
const editor = useEditorStore();
const terminal = useTerminalStore();
const fileSearchStore = useFileSearchStore();
const explorerStore = useExplorerStore();

const input = ref("");
const imageInputRef = ref<HTMLInputElement | null>(null);
const messagesEl = ref<HTMLElement | null>(null);

interface AttachedFile {
  name: string;
  relativePath: string;
  content?: string;
}
const attachedFiles = ref<AttachedFile[]>([]);
const attachedImages = ref<string[]>([]);
const showMentionDropdown = ref(false);
const showModelDropdown = ref(false);

const mentionQuery = ref("");

const mentionFilesList = computed(() => {
  const q = mentionQuery.value.toLowerCase().trim();
  const files = fileSearchStore.files;
  return (q ? files.filter(f => f.toLowerCase().includes(q)) : files).slice(0, 10);
});

// Build MarkdownIt with custom fence renderer for Apply / Run in Terminal
const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

const defaultFence = md.renderer.rules.fence!.bind(md.renderer);
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const lang = (token.info || "").trim().toLowerCase();
  const code = token.content.trim();
  const isShell = ["bash", "sh", "shell", "zsh"].includes(lang);

  const inner = defaultFence(tokens, idx, options, env, self);
  const btn = isShell
    ? `<button class="cb-btn run-btn" data-cmd="${encodeURIComponent(code)}">▶ Run in Terminal</button>`
    : `<button class="cb-btn apply-btn" data-code="${encodeURIComponent(code)}">✅ Apply</button>`;

  return `<div class="cb-wrap">${inner}${btn}</div>`;
};

function renderMarkdown(text: string) {
  return md.render(text);
}

// Delegate codeblock button clicks in messages container
function onMessagesClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  if (target.classList.contains("apply-btn")) {
    const code = decodeURIComponent(target.dataset.code || "");
    editor.applyCode(code);
  }

  if (target.classList.contains("run-btn")) {
    const cmd = decodeURIComponent(target.dataset.cmd || "");
    terminal.execute(cmd);
  }
}

async function scrollToBottom() {
  await nextTick();
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
}

// Image attachment
function triggerImageUpload() { imageInputRef.value?.click(); }
function onImageSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => { if (typeof ev.target?.result === "string") attachedImages.value.push(ev.target.result); };
  reader.readAsDataURL(file);
  (e.target as HTMLInputElement).value = "";
}
function removeAttachedImage(i: number) { attachedImages.value.splice(i, 1); }
function removeAttachedFile(i: number) { attachedFiles.value.splice(i, 1); }

async function attachFile(relativePath: string) {
  if (attachedFiles.value.some(f => f.relativePath === relativePath)) return;
  const name = relativePath.split("/").pop() || relativePath;
  try {
    const content = await readFile(`${explorerStore.rootPath}/${relativePath}`);
    attachedFiles.value.push({ name, relativePath, content });
  } catch (e) { console.error("Failed to read file:", e); }
}

function onInputChanged(e: Event) {
  const target = e.target as HTMLInputElement;
  const before = target.value.slice(0, target.selectionStart ?? 0);
  const atIdx = before.lastIndexOf("@");
  if (atIdx !== -1 && (atIdx === 0 || before[atIdx - 1] === " ")) {
    const q = before.slice(atIdx + 1);
    if (!q.includes(" ")) { showMentionDropdown.value = true; mentionQuery.value = q; return; }
  }
  showMentionDropdown.value = false;
}

function selectMentionFile(file: string) {
  const target = document.querySelector<HTMLInputElement>(".chat-input textarea");
  if (target) {
    const before = input.value.slice(0, target.selectionStart ?? 0);
    const atIdx = before.lastIndexOf("@");
    if (atIdx !== -1) input.value = input.value.slice(0, atIdx) + input.value.slice(target.selectionStart ?? 0);
  }
  attachFile(file);
  showMentionDropdown.value = false;
}

async function _send(prompt: string, imgs: string[], files: AttachedFile[], systemPrefix?: string) {
  const visualFiles = files.map(f => ({ name: f.name, path: f.relativePath }));
  const fullPrompt = systemPrefix ? `${systemPrefix}\n\n${prompt}` : prompt;

  ai.addMessage("user", prompt || systemPrefix || "", imgs, visualFiles);
  input.value = "";
  attachedImages.value = [];
  attachedFiles.value = [];
  showMentionDropdown.value = false;
  await scrollToBottom();
  ai.setLoading(true);

  // Add an empty assistant message to hold the streamed chunks
  ai.addMessage("assistant", "");

  try {
    const mentionedPayload = files.map(f => ({ name: f.relativePath, content: f.content || "" }));
    await askAI(
      fullPrompt,
      imgs,
      mentionedPayload,
      ai.selectedModel,
      (chunk) => {
        ai.appendToLastMessage(chunk);
        scrollToBottom();
      }
    );
  } catch (error) {
    ai.appendToLastMessage("❌ Failed to get AI response.");
  } finally {
    ai.setLoading(false);
  }
}

async function send() {
  if (!input.value.trim() && !attachedImages.value.length && !attachedFiles.value.length) return;
  await _send(input.value, [...attachedImages.value], [...attachedFiles.value]);
}

async function explainSelection() {
  const code = editor.currentFile?.selectedCode;
  if (!code) { ai.addMessage("assistant", "Please select code first."); return; }
  await _send("", [], [], `Explain this code:\n\`\`\`\n${code}\n\`\`\``);
}

async function fixCode() {
  const code = editor.currentFile?.selectedCode;
  if (!code) { ai.addMessage("assistant", "Please select code first."); return; }
  await _send("", [], [], `Fix any bugs or issues in this code:\n\`\`\`\n${code}\n\`\`\``);
}

async function refactorCode() {
  const code = editor.currentFile?.selectedCode;
  if (!code) { ai.addMessage("assistant", "Please select code first."); return; }
  await _send("", [], [], `Refactor this code to make it cleaner, more readable, and idiomatic:\n\`\`\`\n${code}\n\`\`\``);
}

async function writeTests() {
  const code = editor.currentFile?.selectedCode;
  if (!code) { ai.addMessage("assistant", "Please select code first."); return; }
  await _send("", [], [], `Write comprehensive unit tests for this code:\n\`\`\`\n${code}\n\`\`\``);
}

async function documentCode() {
  const code = editor.currentFile?.selectedCode;
  if (!code) { ai.addMessage("assistant", "Please select code first."); return; }
  await _send("", [], [], `Add professional documentation comments to this code:\n\`\`\`\n${code}\n\`\`\``);
}

async function optimizeCode() {
  const code = editor.currentFile?.selectedCode;
  if (!code) { ai.addMessage("assistant", "Please select code first."); return; }
  await _send("", [], [], `Optimize this code for better performance, lower complexity, and memory efficiency:\n\`\`\`\n${code}\n\`\`\``);
}

async function generatePlan() {
  const base = input.value.trim() || (editor.currentFile ? `the active file: ${editor.currentFile.name}` : 'the workspace');
  await _send(
    "",
    [...attachedImages.value],
    [...attachedFiles.value],
    `Create a detailed step-by-step implementation plan (as markdown [ ] checkboxes) for: ${base}`
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

onMounted(() => {
  ai.loadModels();
});
</script>

<template>
  <div class="h-full flex flex-col bg-surface-container-lowest text-on-surface select-none">

    <!-- Model Select Bar -->
    <div class="flex items-center gap-2 px-3 py-1.5 border-b border-outline-variant shrink-0" style="background-color:#1c1b1b">
      <!-- Custom Model Dropdown -->
      <div class="relative flex-1 min-w-0">
        <button
          @click="showModelDropdown = !showModelDropdown"
          class="w-full flex items-center justify-between gap-1 px-2 py-1 rounded text-[11px] font-mono truncate cursor-pointer border"
          style="color:#e5e2e1;background-color:#20201f;border-color:#3A3A3A;"
        >
          <span class="truncate">{{ ai.selectedModel || 'Select model...' }}</span>
          <span class="material-symbols-outlined shrink-0" style="font-size:12px;color:#8e9192">expand_more</span>
        </button>
        <div
          v-if="showModelDropdown"
          class="absolute top-full left-0 right-0 z-50 mt-0.5 rounded border overflow-hidden"
          style="background-color:#20201f;border-color:#3A3A3A;max-height:200px;overflow-y:auto;"
        >
          <button
            v-for="m in ai.availableModels"
            :key="m"
            @click="ai.selectedModel = m; showModelDropdown = false"
            class="w-full text-left px-2 py-1.5 text-[11px] font-mono truncate block"
            :style="ai.selectedModel === m ? 'color:#e5e2e1;background-color:#2E2E2E;' : 'color:#c4c7c7;background-color:transparent;'"
            @mouseover="($event.target as HTMLElement).style.backgroundColor='#2E2E2E'"
            @mouseleave="($event.target as HTMLElement).style.backgroundColor = ai.selectedModel === m ? '#2E2E2E' : 'transparent'"
          >{{ m }}</button>
        </div>
      </div>
      <label class="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none shrink-0" style="color:#8e9192">
        <input type="checkbox" v-model="ai.autocompleteEnabled" class="rounded" />
        <span class="whitespace-nowrap">GHOST</span>
      </label>
      <button class="rounded px-1.5 py-0.5 text-xs transition-colors shrink-0 border" style="color:#8e9192;background-color:transparent;border-color:#3A3A3A;" @click="ai.clearMessages()" title="Clear Chat">
        🗑
      </button>
    </div>

    <!-- Messages & Context -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-5 select-text scrollbar-thin" ref="messagesEl" @click="onMessagesClick">
      
      <!-- Active Context Info Box -->
      <div v-if="editor.currentFile" class="flex flex-col gap-2 select-none">
        <div class="flex items-center gap-2 text-[10px] font-bold tracking-wider text-on-surface-variant">
          <span class="material-symbols-outlined text-[14px]">info</span>
          CONTEXT ACTIVE
        </div>
        <div class="border border-outline-variant bg-surface-container rounded p-2 text-xs font-mono text-on-surface-variant flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[14px] text-primary">code</span>
            <span>{{ editor.currentFile.name }}</span>
          </div>
          <span class="text-[9px] uppercase border border-outline-variant px-1.5 rounded font-bold">Focused</span>
        </div>
      </div>

      <!-- Empty state when no chat -->
      <div v-if="!ai.messages.length" class="flex-grow flex flex-col items-center justify-center text-center p-4 text-on-surface-variant gap-2 select-none">
        <span class="material-symbols-outlined text-2xl text-on-surface-variant/30">smart_toy</span>
        <p class="text-[11px] text-on-surface-variant/60 leading-relaxed max-w-[180px]">Ask about your code or press @ to mention a file.</p>
      </div>

      <!-- Message History List -->
      <div v-for="message in ai.messages" :key="message.id" class="flex flex-col gap-1 w-full" :class="[message.role === 'user' ? 'items-end' : 'items-start']">
        <!-- Message Role Header -->
        <div class="text-[9px] font-bold tracking-widest text-on-surface-variant px-1 uppercase flex items-center gap-1 opacity-75">
          <span v-if="message.role !== 'user'" class="material-symbols-outlined text-[11px] text-primary animate-pulse">bolt</span>
          {{ message.role === 'user' ? 'YOU' : 'NORDIC AI' }}
        </div>

        <!-- Chat Bubble -->
        <div 
          class="p-3.5 rounded-lg text-xs font-sans leading-relaxed border shadow-sm" 
          :class="[
            message.role === 'user' 
              ? 'bg-surface-variant border-outline-variant text-on-surface max-w-[85%] rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg' 
              : 'bg-surface-container-high border-outline-variant/70 text-on-surface max-w-[92%] rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg'
          ]"
        >
          <div class="content markdown-body" v-html="renderMarkdown(message.content)" />
          
          <!-- Code actions copy-button or similar for helper -->
          <div v-if="message.role !== 'user'" class="mt-4 flex gap-2 select-none">
            <button class="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase border border-outline-variant px-2 py-1 rounded hover:bg-surface-variant transition-colors text-on-surface-variant" @click="copyToClipboard(message.content)">
              <span class="material-symbols-outlined text-[14px]">content_copy</span> Copy
            </button>
            <button class="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase border border-outline-variant px-2 py-1 rounded hover:bg-surface-variant transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined text-[14px]">thumb_up</span>
            </button>
          </div>
        </div>

        <!-- Extra attachments -->
        <div v-if="message.images?.length" class="flex flex-wrap gap-2 mt-1 select-none justify-end">
          <img v-for="(img, i) in message.images" :key="i" :src="img" class="max-w-[180px] max-h-[180px] rounded border border-outline-variant object-cover hover:scale-[1.01] transition-transform" />
        </div>
        <div v-if="message.mentionedFiles?.length" class="flex flex-wrap gap-1.5 mt-1 select-none justify-end">
          <span v-for="(f, i) in message.mentionedFiles" :key="i" class="bg-surface-container border border-outline-variant rounded px-2 py-0.5 text-[9px] text-on-surface-variant font-mono">
            📄 {{ f.name }}
          </span>
        </div>
      </div>

      <!-- Thinking indicator -->
      <div v-if="ai.loading" class="flex items-center gap-2 p-2 text-xs text-primary select-none animate-pulse">
        <span class="material-symbols-outlined text-sm">bolt</span>
        <span>Thinking and generating...</span>
      </div>
    </div>

    <!-- Action Shortcuts Grid -->
    <div class="p-2 border-t border-outline-variant shrink-0 bg-surface-container-low flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-[10px] font-bold tracking-wider text-on-surface-variant px-1 select-none">
        <span>SELECTION ASSISTANT</span>
        <span class="text-[9px] uppercase border border-outline-variant/50 px-1 rounded opacity-75">Monaco Selection</span>
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        <button 
          class="flex items-center justify-center gap-1 bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface text-[11px] font-mono py-1 rounded transition-colors cursor-pointer" 
          @click="explainSelection"
          title="Explain selected code block"
        >
          <span class="material-symbols-outlined text-[13px]">help_center</span>
          Explain
        </button>
        <button 
          class="flex items-center justify-center gap-1 bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface text-[11px] font-mono py-1 rounded transition-colors cursor-pointer" 
          @click="fixCode"
          title="Fix bugs or errors in selection"
        >
          <span class="material-symbols-outlined text-[13px]">bug_report</span>
          Fix Bugs
        </button>
        <button 
          class="flex items-center justify-center gap-1 bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface text-[11px] font-mono py-1 rounded transition-colors cursor-pointer" 
          @click="refactorCode"
          title="Refactor selected code for quality"
        >
          <span class="material-symbols-outlined text-[13px]">cleaning_services</span>
          Refactor
        </button>
        <button 
          class="flex items-center justify-center gap-1 bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface text-[11px] font-mono py-1 rounded transition-colors cursor-pointer" 
          @click="optimizeCode"
          title="Optimize execution speed"
        >
          <span class="material-symbols-outlined text-[13px]">speed</span>
          Optimize
        </button>
        <button 
          class="flex items-center justify-center gap-1 bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface text-[11px] font-mono py-1 rounded transition-colors cursor-pointer" 
          @click="writeTests"
          title="Write tests for selection"
        >
          <span class="material-symbols-outlined text-[13px]">science</span>
          Write Tests
        </button>
        <button 
          class="flex items-center justify-center gap-1 bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface text-[11px] font-mono py-1 rounded transition-colors cursor-pointer" 
          @click="documentCode"
          title="Generate comments and JSDoc"
        >
          <span class="material-symbols-outlined text-[13px]">sticky_note_2</span>
          Document
        </button>
      </div>
      <button 
        class="w-full bg-primary text-background hover:bg-white text-[11px] font-mono font-bold py-1 px-3 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer uppercase" 
        @click="generatePlan"
      >
        <span class="material-symbols-outlined text-[14px]">checklist</span> Generate Checklists (PLAN)
      </button>
    </div>

    <!-- Chat Input Area -->
    <div class="p-4 bg-surface-container border-t border-outline-variant shrink-0 relative">
      <!-- Mention dropdown -->
      <div v-if="showMentionDropdown" class="absolute bottom-full left-4 right-4 bg-surface-container border border-outline-variant rounded-md max-h-[160px] overflow-y-auto shadow-2xl z-50 mb-1">
        <div v-for="file in mentionFilesList" :key="file" class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-surface-variant border-b border-outline-variant/30 last:border-b-0 text-xs text-on-surface" @click="selectMentionFile(file)">
          <span>📄 {{ file.split("/").pop() }}</span>
          <span class="text-[10px] opacity-40 truncate max-w-[120px]">{{ file }}</span>
        </div>
      </div>

      <!-- Attachment bar -->
      <div v-if="attachedImages.length || attachedFiles.length" class="flex flex-wrap gap-2 p-2 bg-surface border border-b-0 border-outline-variant rounded-t select-none">
        <div v-for="(img, i) in attachedImages" :key="i" class="relative w-9 h-9 rounded border border-outline-variant overflow-hidden">
          <img :src="img" class="w-full h-full object-cover" />
          <button class="absolute top-0 right-0 bg-error text-on-error rounded-full w-3.5 h-3.5 text-[8px] flex items-center justify-center transition-all" @click="removeAttachedImage(i)">×</button>
        </div>
        <div v-for="(file, i) in attachedFiles" :key="i" class="flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded px-2 py-1 text-[10px] text-on-surface">
          <span>📄 {{ file.name }}</span>
          <button class="text-error font-bold" @click="removeAttachedFile(i)">×</button>
        </div>
      </div>

      <!-- Real Input Box -->
      <div class="relative flex flex-col border border-outline-variant bg-surface rounded focus-within:border-primary transition-colors">
        <textarea
          v-model="input"
          @input="onInputChanged"
          @keydown.enter.prevent="send"
          class="w-full bg-transparent text-on-surface p-3 text-xs font-sans resize-none focus:outline-none placeholder-on-surface-variant/50 min-h-[72px]"
          placeholder="Ask about your code... (@ to mention file)"
        ></textarea>
        
        <div class="flex justify-between items-center p-2 border-t border-outline-variant/30 bg-surface-container-lowest rounded-b">
          <div class="flex gap-1">
            <input type="file" ref="imageInputRef" accept="image/*" class="hidden" @change="onImageSelected" />
            <button class="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors flex items-center" @click="triggerImageUpload" title="Attach Image">
              <span class="material-symbols-outlined text-[18px]">attach_file</span>
            </button>
            <button class="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded transition-colors flex items-center" @click="terminal.execute('git status')" title="Use Terminal Context">
              <span class="material-symbols-outlined text-[18px]">terminal</span>
            </button>
          </div>
          
          <button 
            @click="send" 
            class="bg-primary text-background px-3 py-1.5 rounded flex items-center gap-1 hover:bg-white transition-colors text-[10px] font-bold tracking-wider uppercase font-sans"
          >
            SEND <span class="material-symbols-outlined text-[14px]">send</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 5px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: var(--color-outline-variant); border-radius: 3px; }
</style>

<style>
.cb-wrap {
  position: relative;
  margin: 12px 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-outline-variant);
}

.cb-wrap pre {
  margin: 0 !important;
  border-radius: 0 !important;
  background-color: #1a1a1a !important;
}

.cb-wrap code {
  background-color: transparent !important;
  color: #cdd6f4 !important;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.cb-btn {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 11px;
  border-top: 1px solid var(--color-outline-variant);
  cursor: pointer;
  font-weight: 700;
  text-align: center;
  transition: all 0.15s ease-in-out;
}

.apply-btn {
  background: var(--color-surface-container-high);
  color: var(--color-primary);
}
.apply-btn:hover {
  background: var(--color-primary);
  color: var(--color-background);
}

.run-btn {
  background: var(--color-surface-container-high);
  color: var(--color-primary);
}
.run-btn:hover {
  background: var(--color-primary);
  color: var(--color-background);
}

/* ─── Premium Markdown Styling ─────────────────────────────────────── */
.markdown-body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: var(--color-on-surface);
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-body p:last-child {
  margin-bottom: 0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--color-on-surface);
  line-height: 1.25;
}

.markdown-body h1 { font-size: 1.4em; border-bottom: 1px solid var(--color-outline-variant); padding-bottom: 4px; }
.markdown-body h2 { font-size: 1.25em; }
.markdown-body h3 { font-size: 1.1em; }
.markdown-body h4 { font-size: 1.0em; }

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 12px;
  padding-left: 1.5rem;
}

.markdown-body ul {
  list-style-type: disc;
}

.markdown-body ol {
  list-style-type: decimal;
}

.markdown-body li {
  margin-bottom: 4px;
}

.markdown-body li > p {
  margin-top: 4px;
  margin-bottom: 0;
}

.markdown-body code:not(pre code) {
  padding: 2px 5px;
  font-size: 85%;
  background-color: #242424;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  color: #f5c2e7;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.markdown-body blockquote {
  margin: 12px 0;
  padding: 0 12px;
  color: var(--color-on-surface-variant);
  border-left: 4px solid var(--color-outline-variant);
  background-color: rgba(255, 255, 255, 0.02);
}

.markdown-body table {
  width: 100%;
  margin-bottom: 16px;
  border-collapse: collapse;
}

.markdown-body th,
.markdown-body td {
  padding: 6px 12px;
  border: 1px solid var(--color-outline-variant);
  text-align: left;
}

.markdown-body th {
  background-color: var(--color-surface-container-high);
  font-weight: 600;
}

.markdown-body hr {
  height: 1px;
  border: none;
  background-color: var(--color-outline-variant);
  margin: 16px 0;
}
</style>