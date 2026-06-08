import type { FileNode } from "@/app/types/tree";

/**
 * Flatten a FileNode tree into a list of file paths (no directories).
 */
export function flattenTree(
  nodes: FileNode[],
  rootPath: string
): string[] {
  const result: string[] = [];

  function walk(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.is_dir) {
        if (node.children?.length) walk(node.children);
      } else {
        // Return relative path from rootPath
        const rel = node.path.startsWith(rootPath)
          ? node.path.slice(rootPath.length).replace(/^[\/\\]/, "")
          : node.path;
        result.push(rel);
      }
    }
  }

  walk(nodes);
  return result;
}