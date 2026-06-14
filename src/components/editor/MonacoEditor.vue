<script setup lang="ts">
import * as monaco from "monaco-editor";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useEditorStore } from "@/app/stores/editor";
import { useAIStore } from "@/app/stores/ai";
import { writeFile } from "@/services/explorer";
import { autocomplete } from "@/services/ai";
import { formatCode, isSupportedLanguage } from "@/services/formatter";

const editorStore = useEditorStore();
const aiStore = useAIStore();
const isFormatting = ref(false);


const editorContainer = ref<HTMLDivElement | null>(null);

let editor: monaco.editor.IStandaloneCodeEditor;
let completionDisposable: monaco.IDisposable | null = null;
let autocompleteDebounce: ReturnType<typeof setTimeout> | null = null;

const handleSave = async (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    if (!editorStore.currentFile) return;
    try {
      await writeFile(editorStore.currentFile.id, editorStore.currentFile.content);
      editorStore.markSaved(editorStore.currentFile.id);
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  }

  // Ctrl+Shift+F → Format with Prettier
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") {
    event.preventDefault();
    if (!editorStore.currentFile || isFormatting.value) return;
    const lang = editorStore.currentFile.language;
    if (!isSupportedLanguage(lang)) return;
    isFormatting.value = true;
    try {
      const formatted = await formatCode(editor.getValue(), lang);
      const model = editor.getModel();
      if (!model) return;
      const pos = editor.getPosition();
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: formatted }],
        () => null
      );
      if (pos) editor.setPosition(pos);
      editorStore.updateContent(formatted);
    } catch (e) {
      console.warn("Prettier format error:", e);
    } finally {
      isFormatting.value = false;
    }
  }
};


function registerInlineCompletions() {
  if (completionDisposable) {
    completionDisposable.dispose();
  }

  const SUPPORTED_LANGUAGES = [
    "typescript", "javascript", "python", "rust", "go",
    "cpp", "c", "java", "html", "css", "vue", "json", "markdown",
  ];

  completionDisposable = monaco.languages.registerInlineCompletionsProvider(
    SUPPORTED_LANGUAGES,
    {
      provideInlineCompletions: async (model, position) => {
        if (!aiStore.autocompleteEnabled) {
          return { items: [] };
        }

        const prefix = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const suffix = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: model.getLineCount(),
          endColumn: model.getLineMaxColumn(model.getLineCount()),
        });

        // Skip trivial contexts
        if (prefix.trim().length < 5) {
          return { items: [] };
        }

        try {
          const suggestion = await autocomplete(
            prefix,
            suffix,
            aiStore.selectedModel
          );

          if (!suggestion || !suggestion.trim()) {
            return { items: [] };
          }

          return {
            items: [
              {
                insertText: suggestion,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              },
            ],
          };
        } catch (e) {
          console.error("Autocomplete error:", e);
          return { items: [] };
        }
      },
      disposeInlineCompletions: () => {},
    }
  );
}

onMounted(() => {
  if (!editorContainer.value) return;

  // ─── Nordic Vivid Theme ─────────────────────────────────────────────
  // Uses Monaco's actual monarch token names (NOT TextMate scopes).
  // Colors: Catppuccin Mocha palette — 5 distinct hues
  monaco.editor.defineTheme("nordic-theme", {
    base: "vs-dark",
    inherit: false,      // <-- false: don't let vs-dark override our rules
    rules: [
      // ⬜ Base / identifiers
      { token: "",                    foreground: "CDD6F4" },
      { token: "identifier",          foreground: "CDD6F4" },
      { token: "variable",            foreground: "CDD6F4" },

      // 🔵 Keywords — bright blue
      { token: "keyword",             foreground: "89B4FA", fontStyle: "bold" },
      { token: "keyword.operator",    foreground: "89DCEB" },

      // 🟢 Strings — green
      { token: "string",              foreground: "A6E3A1" },
      { token: "string.escape",       foreground: "94E2D5" },

      // 🟠 Numbers — peach/orange
      { token: "number",              foreground: "FAB387" },
      { token: "number.float",        foreground: "FAB387" },
      { token: "number.hex",          foreground: "FAB387" },
      { token: "number.octal",        foreground: "FAB387" },
      { token: "number.binary",       foreground: "FAB387" },

      // 🟡 Types — golden yellow
      { token: "type",                foreground: "F9E2AF" },
      { token: "type.identifier",     foreground: "F9E2AF" },
      { token: "class",               foreground: "F9E2AF" },

      // 🩵 Tags / HTML elements — pink/red
      { token: "tag",                 foreground: "F38BA8" },
      { token: "tag.id",              foreground: "F38BA8" },
      { token: "tag.class",           foreground: "A6E3A1" },
      { token: "attribute.name",      foreground: "B4BEFE" },
      { token: "attribute.value",     foreground: "A6E3A1" },

      // 💬 Comments — muted
      { token: "comment",             foreground: "6C7086", fontStyle: "italic" },
      { token: "comment.doc",         foreground: "6C7086", fontStyle: "italic" },

      // ➕ Operators & delimiters — cyan
      { token: "operator",            foreground: "89DCEB" },
      { token: "delimiter",           foreground: "89DCEB" },
      { token: "delimiter.bracket",   foreground: "CBA6F7" },
      { token: "delimiter.array",     foreground: "CBA6F7" },
      { token: "delimiter.parenthesis", foreground: "CDD6F4" },

      // 🔑 Rust-specific
      { token: "keyword.rust",        foreground: "89B4FA", fontStyle: "bold" },
      { token: "string.rust",         foreground: "A6E3A1" },
      { token: "number.rust",         foreground: "FAB387" },
      { token: "type.identifier.rust", foreground: "F9E2AF" },

      // CSS values
      { token: "number.css",          foreground: "FAB387" },
      { token: "string.css",          foreground: "A6E3A1" },
      { token: "attribute.value.css", foreground: "A6E3A1" },
      { token: "keyword.css",         foreground: "89B4FA" },

      // JSON
      { token: "string.key.json",     foreground: "89B4FA" },
      { token: "string.value.json",   foreground: "A6E3A1" },
      { token: "number.json",         foreground: "FAB387" },
      { token: "keyword.json",        foreground: "CBA6F7" },
    ],
    colors: {
      "editor.background":                  "#131313",
      "editor.foreground":                  "#CDD6F4",
      "editor.lineHighlightBackground":     "#1e2228",
      "editor.lineHighlightBorder":         "#252b34",
      "editor.selectionBackground":         "#353535",
      "editor.inactiveSelectionBackground": "#2a2a2a",
      "editorLineNumber.foreground":        "#585a5a",
      "editorLineNumber.activeForeground":  "#CDD6F4",
      "editorCursor.foreground":            "#F5C2E7",
      "editorBracketMatch.background":      "#313244",
      "editorBracketMatch.border":          "#89B4FA",
      "editorIndentGuide.background1":      "#313244",
      "editorIndentGuide.activeBackground1": "#585a5a",
      "editorWhitespace.foreground":        "#313244",
      "editorGutter.background":            "#131313",
      "scrollbarSlider.background":         "#313244AA",
      "scrollbarSlider.hoverBackground":    "#45475A",
      "scrollbarSlider.activeBackground":   "#585B70",
    },
  });

  editor = monaco.editor.create(
    editorContainer.value,
    {
      value: "",
      language: "typescript",
      theme: "nordic-theme",
      automaticLayout: true,
      inlineSuggest: {
        enabled: true,
        showToolbar: "onHover",
      },
      fontSize: 13,
      lineHeight: 20,
      fontFamily: "JetBrains Mono",
    }
  );

  registerInlineCompletions();

  let isLoadingFile = false;

  watch(
    () => editorStore.currentFile,
    (file) => {
      if (!file) return;

      isLoadingFile = true;

      editor.setValue(file.content);

      monaco.editor.setModelLanguage(
        editor.getModel()!,
        file.language
      );

      isLoadingFile = false;
    },
    {
      immediate: true,
    }
  );

  // Watch for pending code apply requests from AI chat
  watch(
    () => editorStore.pendingCodeApply,
    (code) => {
      if (!code) return;

      const selection = editor.getSelection();

      if (selection && !selection.isEmpty()) {
        // Replace the current selection
        editor.executeEdits("ai-apply", [
          {
            range: selection,
            text: code,
          },
        ]);
      } else {
        // Insert at cursor if no selection
        const position = editor.getPosition();
        if (position) {
          editor.executeEdits("ai-apply", [
            {
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
              text: code,
            },
          ]);
        }
      }

      editorStore.pendingCodeApply = null;
      editor.focus();
    }
  );

  editor.onDidChangeModelContent(() => {
    if (isLoadingFile) return;
    if (!editorStore.currentFile) return;

    const model = editor.getModel();
    if (!model) return;

    const content = model.getValue();
    editorStore.updateContent(content);
  });

  editor.onDidChangeCursorSelection(() => {
    const selection = editor.getSelection();
    if (!selection) return;

    const code =
      editor
        .getModel()
        ?.getValueInRange(selection) || "";

    editorStore.setSelectedCode(code);
  });

  window.addEventListener("keydown", handleSave);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleSave);
  completionDisposable?.dispose();
  if (autocompleteDebounce) clearTimeout(autocompleteDebounce);
  editor?.dispose();
});
</script>

<template>
  <div
    ref="editorContainer"
    class="editor"
  />
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
}
</style>