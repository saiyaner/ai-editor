export function detectLanguage(name: string): string {
  const lowercase = name.toLowerCase();
  
  if (lowercase.endsWith(".ts") || lowercase.endsWith(".tsx")) return "typescript";
  if (lowercase.endsWith(".js") || lowercase.endsWith(".jsx")) return "javascript";
  if (lowercase.endsWith(".vue")) return "html"; // Or vue if monaco supports it; html is safe. Monaco uses 'html' for vue templates usually.
  if (lowercase.endsWith(".html")) return "html";
  if (lowercase.endsWith(".css")) return "css";
  if (lowercase.endsWith(".scss")) return "scss";
  if (lowercase.endsWith(".less")) return "less";
  if (lowercase.endsWith(".json")) return "json";
  if (lowercase.endsWith(".rs")) return "rust";
  if (lowercase.endsWith(".py")) return "python";
  if (lowercase.endsWith(".go")) return "go";
  if (lowercase.endsWith(".cpp") || lowercase.endsWith(".cc") || lowercase.endsWith(".cxx") || lowercase.endsWith(".h") || lowercase.endsWith(".hpp")) return "cpp";
  if (lowercase.endsWith(".c")) return "c";
  if (lowercase.endsWith(".java")) return "java";
  if (lowercase.endsWith(".md") || lowercase.endsWith(".markdown")) return "markdown";
  if (lowercase.endsWith(".sh") || lowercase.endsWith(".bash")) return "shell";
  if (lowercase.endsWith(".yaml") || lowercase.endsWith(".yml")) return "yaml";
  if (lowercase.endsWith(".toml")) return "toml";
  if (lowercase.endsWith(".sql")) return "sql";

  return "plaintext";
}