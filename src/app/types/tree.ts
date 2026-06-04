export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

export const projectTree: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "main",
        name: "main.ts",
        type: "file",
      },
      {
        id: "app",
        name: "App.vue",
        type: "file",
      },
    ],
  },
];