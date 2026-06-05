import { defineStore } from "pinia";
import { ref } from "vue";

import type { FileNode } from "../types/tree";

export const useExplorerStore = defineStore(
  "explorer",
  () => {
    const rootPath = ref("");

    const tree = ref<FileNode[]>([]);

    function setRoot(path: string) {
      rootPath.value = path;
    }

    function setTree(nodes: FileNode[]) {
      tree.value = nodes;
    }

    return {
      rootPath,
      tree,
      setRoot,
      setTree,
    };
  }
);