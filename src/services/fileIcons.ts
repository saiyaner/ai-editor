import manifest from "@/assets/icon-manifest.json";

/**
 * Returns the URL path to the SVG icon for a given file/folder.
 * Icons are served from /file-icons/ (copied from material-icon-theme at build).
 */
export function getFileIconUrl(
  name: string,
  isDir: boolean,
  isExpanded = false
): string {
  const base = "/file-icons";

  if (isDir) {
    const lname = name.toLowerCase();
    const folderMap = isExpanded
      ? (manifest.folderNamesExpanded as Record<string, string>)
      : (manifest.folderNames as Record<string, string>);
    const iconName = folderMap[lname] ?? (isExpanded ? manifest.defaultFolderExpanded : manifest.defaultFolder);
    return `${base}/${iconName}.svg`;
  }

  // Check exact filename first
  const lname = name.toLowerCase();
  const byName = (manifest.fileNames as Record<string, string>)[lname];
  if (byName) return `${base}/${byName}.svg`;

  // Check by extension (support multi-dot like .d.ts)
  const parts = lname.split(".");
  for (let i = 1; i < parts.length; i++) {
    const ext = parts.slice(i).join(".");
    const byExt = (manifest.fileExtensions as Record<string, string>)[ext];
    if (byExt) return `${base}/${byExt}.svg`;
  }

  return `${base}/${manifest.defaultFile}.svg`;
}
