/**
 * Prettier standalone formatter service.
 * Runs entirely in-browser/renderer — no backend needed.
 */
import { format } from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as parserTypescript from "prettier/plugins/typescript";
import * as parserHtml from "prettier/plugins/html";
import * as parserCss from "prettier/plugins/postcss";
import * as parserMarkdown from "prettier/plugins/markdown";
import * as parserEstree from "prettier/plugins/estree";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrettierPlugin = any;

const pluginMap: Record<string, PrettierPlugin[]> = {
  javascript: [parserEstree, parserBabel],
  javascriptreact: [parserEstree, parserBabel],
  typescript: [parserEstree, parserTypescript],
  typescriptreact: [parserEstree, parserTypescript],
  html: [parserHtml],
  vue: [parserHtml],
  css: [parserCss],
  scss: [parserCss],
  less: [parserCss],
  markdown: [parserMarkdown],
  json: [parserEstree, parserBabel],
  jsonc: [parserEstree, parserBabel],
};

const parserNameMap: Record<string, string> = {
  javascript: "babel",
  javascriptreact: "babel",
  typescript: "typescript",
  typescriptreact: "typescript",
  html: "html",
  vue: "html",
  css: "css",
  scss: "scss",
  less: "less",
  markdown: "markdown",
  json: "json",
  jsonc: "json",
};

export async function formatCode(code: string, language: string): Promise<string> {
  const parser = parserNameMap[language];
  const plugins = pluginMap[language];

  if (!parser || !plugins) {
    throw new Error(`Prettier: no parser for language "${language}"`);
  }

  return format(code, {
    parser,
    plugins,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
  });
}

export function isSupportedLanguage(language: string): boolean {
  return language in parserNameMap;
}
