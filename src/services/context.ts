import { useEditorStore } from "@/app/stores/editor";

export function getCurrentFileContext() {
  const editor =
    useEditorStore();

  const file =
    editor.currentFile;

  if (!file) {
    return "No file opened";
  }

  return `
Current File:
${file.name}

Path:
${file.path}

Language:
${file.language}

Content:
${file.content}
`;
}