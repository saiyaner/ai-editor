<script setup lang="ts">
import { ref } from "vue";
import { useEditorStore } from "@/app/stores/editor";
import { useGitStore } from "@/app/stores/git";
import { formatCode, isSupportedLanguage } from "@/services/formatter";

const editorStore = useEditorStore();
const gitStore = useGitStore();
const isFormatting = ref(false);

async function handleFormat() {
  const file = editorStore.currentFile;
  if (!file || isFormatting.value || !isSupportedLanguage(file.language)) return;
  isFormatting.value = true;
  try {
    const formatted = await formatCode(file.content, file.language);
    editorStore.updateContent(formatted);
  } catch (e) {
    console.warn("Format error:", e);
  } finally {
    isFormatting.value = false;
  }
}
</script>

<template>
  <footer class="bg-surface-container-lowest text-on-surface-variant text-xs font-code border-t border-outline-variant flex justify-between items-center px-4 w-full h-6 shrink-0 z-50 select-none">
    <div class="flex items-center gap-4 h-full">
      <div class="flex items-center gap-1 hover:text-on-surface cursor-pointer h-full transition-colors">
        <span class="material-symbols-outlined text-[14px]">account_tree</span>
        <span>{{ gitStore.branch || 'main' }}</span>
      </div>
      <div class="flex items-center gap-1 hover:text-on-surface cursor-pointer h-full transition-colors">
        <span class="material-symbols-outlined text-[14px] text-error">error</span>
        <span>0</span>
        <span class="material-symbols-outlined text-[14px] ml-1 text-on-surface">warning</span>
        <span>0</span>
      </div>
    </div>
    
    <div class="flex items-center gap-4 h-full">
      <div class="hover:text-on-surface cursor-pointer h-full flex items-center transition-colors">Ln 1, Col 1</div>
      <div class="hover:text-on-surface cursor-pointer h-full flex items-center transition-colors">Spaces: 2</div>
      <div class="hover:text-on-surface cursor-pointer h-full flex items-center transition-colors">UTF-8</div>
      <div class="hover:text-on-surface cursor-pointer h-full flex items-center transition-colors">
        {{ editorStore.currentFile?.language || 'Plain Text' }}
      </div>

      <!-- Prettier Format Button -->
      <button
        v-if="editorStore.currentFile && isSupportedLanguage(editorStore.currentFile.language)"
        @click="handleFormat"
        :disabled="isFormatting"
        class="h-full flex items-center gap-1 px-1.5 hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50"
        title="Format Document (Ctrl+Shift+F)"
      >
        <span class="material-symbols-outlined text-[13px]">{{ isFormatting ? 'sync' : 'auto_fix_high' }}</span>
        <span class="text-[10px]">Prettier</span>
      </button>

      <div class="hover:text-on-surface cursor-pointer h-full flex items-center gap-1 ml-2 transition-colors">
        <span class="material-symbols-outlined text-[14px]">notifications</span>
      </div>
    </div>
  </footer>
</template>