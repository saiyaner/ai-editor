<script setup lang="ts">
import { ref, computed } from "vue";
import type { FileNode } from "@/app/types/tree";
import { useEditorStore } from "@/app/stores/editor";
import { readFile } from "@/services/explorer";
import { detectLanguage } from "@/services/language";
import { getFileIconUrl } from "@/services/fileIcons";

const props = withDefaults(
  defineProps<{
    node: FileNode;
    depth?: number;
  }>(),
  {
    depth: 0,
  }
);

const editorStore = useEditorStore();
const isExpanded = ref(false);

const isCurrentFile = computed(() => {
  return editorStore.currentFile?.id === props.node.path;
});

const iconUrl = computed(() =>
  getFileIconUrl(props.node.name, props.node.is_dir, isExpanded.value)
);

async function handleClick() {
  if (props.node.is_dir) {
    isExpanded.value = !isExpanded.value;
  } else {
    try {
      const content = await readFile(props.node.path);
      const language = detectLanguage(props.node.name);
      editorStore.openFile({
        id: props.node.path,
        path: props.node.path,
        name: props.node.name,
        content: content,
        language: language,
        dirty: false,
      });
    } catch (error) {
      console.error("Failed to read file:", error);
    }
  }
}
</script>

<template>
  <div class="select-none">
    <div
      :class="[
        isCurrentFile
          ? 'bg-surface-container-high border-l-2 border-on-surface text-on-surface font-semibold'
          : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface border-l-2 border-transparent'
      ]"
      class="flex items-center gap-1 py-0.5 pr-2 text-[11px] font-mono cursor-pointer transition-colors"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="handleClick"
    >
      <!-- Chevron for dir -->
      <span v-if="node.is_dir" class="material-symbols-outlined shrink-0 text-on-surface-variant" style="font-size:13px">
        {{ isExpanded ? 'expand_more' : 'chevron_right' }}
      </span>
      <span v-else class="w-3.5 shrink-0"></span>

      <!-- Material SVG icon -->
      <img
        :src="iconUrl"
        :alt="node.name"
        class="w-4 h-4 shrink-0 object-contain"
        :style="isCurrentFile ? 'opacity:1' : 'opacity:0.9'"
      />

      <!-- Name -->
      <span class="truncate text-[11px] tracking-normal leading-none">{{ node.name }}</span>
    </div>

    <div v-if="node.is_dir && isExpanded" class="flex flex-col">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<style scoped>
/* file-tree node — layout defined via Tailwind utilities above */
div { box-sizing: border-box; }
</style>
