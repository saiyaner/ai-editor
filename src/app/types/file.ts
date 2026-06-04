export interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
  dirty: boolean;
}