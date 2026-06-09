<script setup lang="ts">
import { ref, computed } from "vue";
import type { FileNode } from "@/app/types/tree";
import { useEditorStore } from "@/app/stores/editor";
import { readFile } from "@/services/explorer";
import { detectLanguage } from "@/services/language";

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
  <div class="file-tree-node">
    <div
      class="node-label"
      :class="{
        'is-active': isCurrentFile,
        'is-directory': node.is_dir
      }"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="handleClick"
    >
      <span class="chevron" v-if="node.is_dir">
        {{ isExpanded ? "▼" : "▶" }}
      </span>
      <span class="chevron placeholder" v-else></span>

      <span class="icon">
        <span v-if="node.is_dir">📁</span>
        <span v-else>📄</span>
      </span>

      <span class="name">{{ node.name }}</span>
    </div>

    <div v-if="node.is_dir && isExpanded" class="node-children">
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
.file-tree-node {
  user-select: none;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #c9d1d9;
  transition: background-color 0.15s, color 0.15s;
}

.node-label:hover {
  background-color: #21262d;
  color: #f0f6fc;
}

.node-label.is-active {
  background-color: #1f6feb33;
  color: #58a6ff;
  font-weight: 500;
}

.chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  font-size: 8px;
  color: #8b949e;
}

.chevron.placeholder {
  width: 12px;
}

.icon {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-children {
  display: flex;
  flex-direction: column;
}
</style>
