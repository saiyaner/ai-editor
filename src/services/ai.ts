import { invoke, Channel } from "@tauri-apps/api/core";
import { getCurrentFileContext } from "./context";
import { SYSTEM_PROMPT } from "./prompt";

export async function askAI(
  prompt: string,
  images: string[] = [],
  mentionedFiles: { name: string; content: string }[] = [],
  model: string = "qwen2.5-coder:3b",
  onChunk: (chunk: string) => void = () => {}
): Promise<void> {
  let context = getCurrentFileContext();

  if (mentionedFiles.length > 0) {
    context += "\n\n=== Mentioned Files ===";
    for (const file of mentionedFiles) {
      context += `\n\nFile: ${file.name}\nContent:\n${file.content}`;
    }
  }

  const finalPrompt = `
${SYSTEM_PROMPT}

${context}

User:
${prompt}
`;

  const channel = new Channel<string>();
  channel.onmessage = (message) => {
    onChunk(message);
  };

  return invoke<void>(
    "ask_ai",
    {
      prompt: finalPrompt,
      images,
      model,
      onChunk: channel,
    }
  );
}

export async function getModels(): Promise<string[]> {
  return invoke<string[]>("get_models");
}

export async function autocomplete(
  prefix: string,
  suffix: string,
  model: string
): Promise<string> {
  return invoke<string>("autocomplete", { prefix, suffix, model });
}