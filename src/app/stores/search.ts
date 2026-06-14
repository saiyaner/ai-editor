import { defineStore } from "pinia";

export interface SearchResult {
  file: string;
  line: number;
  content: string;
}

export const useSearchStore = defineStore("search", {
  state: () => ({
    query: "",
    results: [] as SearchResult[],
  }),

  actions: {
    setResults(results: SearchResult[]) {
      this.results = results;
    },
  },
});