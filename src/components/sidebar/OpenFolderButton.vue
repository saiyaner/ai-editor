<script setup lang="ts">
import { open } from "@tauri-apps/plugin-dialog";

const pickFolder = async () => {
  console.log("BUTTON CLICKED");

  const folder = await open({
    directory: true,
    multiple: false,
  });

  console.log("SELECTED:", folder);
};
</script>

<template>
  <button @click="pickFolder">
    Open Folder
  </button>
</template>