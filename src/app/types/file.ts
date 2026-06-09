export interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  dirty: boolean;
  selectedCode?: string;
}