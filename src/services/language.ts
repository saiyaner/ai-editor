export function detectLanguage(name: string) {
  if (name.endsWith(".ts")) return "typescript";

  if (name.endsWith(".js")) return "javascript";

  if (name.endsWith(".vue")) return "html";

  if (name.endsWith(".md")) return "markdown";

  return "plaintext";
}