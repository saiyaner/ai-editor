import { defineStore } from "pinia";
import { ref } from "vue";
import type { GitFile } from "../types/git";

export const useGitStore =
  defineStore("git", () => {

    const branch =
      ref("");

    const status =
      ref<GitFile[]>([]);

    const files =
      ref<GitFile[]>([]);

    function setBranch(
      value: string
    ) {
      branch.value = value;
    }

    function setStatus(value: GitFile[]) {
      status.value = value;
    }

    function setFiles(value: GitFile[]) {
      files.value = value;
    }

    return {
      branch,
      setBranch,
      status,
      setStatus,
      files,
      setFiles
    };
  });