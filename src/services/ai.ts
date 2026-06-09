import { invoke } from "@tauri-apps/api/core";

import { getCurrentFileContext }
from "./context";

import { SYSTEM_PROMPT }
from "./prompt";

export async function askAI(
  prompt: string
) {
  const context =
    getCurrentFileContext();

  const finalPrompt = `
${SYSTEM_PROMPT}

${context}

User:
${prompt}
`;

  return invoke<string>(
    "ask_ai",
    {
      prompt: finalPrompt,
    }
  );
}