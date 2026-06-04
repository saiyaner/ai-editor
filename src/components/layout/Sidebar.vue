<script setup lang="ts">
import { useEditorStore } from "@/app/stores/editor";
import OpenFolderButton from "@/components/sidebar/OpenFolderButton.vue";

const editorStore = useEditorStore();

const openMain = () => {
  editorStore.openFile({
    id: "1",
    name: "main.ts",
    content: "console.log('Hello World')",
    language: "typescript",
    dirty: false,
  });
};

const openApp = () => {
  editorStore.openFile({
    id: "2",
    name: "App.vue",
    content: "<template><h1>Hello App</h1></template>",
    language: "vue",
    dirty: false,
  });
};

const openReadme = () => {
  editorStore.openFile({
    id: "3",
    name: "README.md",
    content: "# AI Editor\n\nBuilt with Tauri + Vue",
    language: "markdown",
    dirty: false,
  });
};
</script>

<template>
  <div class="sidebar">

    <OpenFolderButton />

    <button @click="openMain">
      main.ts
    </button>

    <button @click="openApp">
      App.vue
    </button>

    <button @click="openReadme">
      README.md
    </button>

  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
  padding: 1rem;
}
</style>