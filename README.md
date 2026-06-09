# AI Editor

AI-powered code editor built with **Vue 3**, **TypeScript**, **Tauri v2**, **Monaco Editor**, and **Ollama**.

Inspired by modern AI-native IDEs such as Cursor, Windsurf, and VS Code, AI Editor provides an integrated development environment with local AI assistance, file management, code editing, and intelligent code explanations.

---

## Features

### Editor

- Monaco Editor integration
- Multi-tab editing
- Dirty file indicators
- Syntax highlighting
- Automatic language detection
- File save support
- Open file from workspace

### File Explorer

- Open Folder
- Workspace tree navigation
- File selection
- Active file tracking

### AI Assistant

- Chat with local AI models
- Explain selected code
- Fix selected code
- Context-aware responses
- Markdown rendering
- Code block rendering
- Workspace-aware prompts

### Architecture

- Frontend: Vue 3 + TypeScript
- State Management: Pinia
- Desktop Runtime: Tauri v2
- Editor Engine: Monaco Editor
- AI Backend: Ollama
- Styling: Custom CSS

---

## Tech Stack

### Frontend

- Vue 3
- TypeScript
- Vite
- Pinia
- Monaco Editor
- Markdown-It

### Backend

- Tauri v2
- Rust

### AI

- Ollama
- DeepSeek Coder
- Qwen Coder
- Any Ollama-compatible model

---

## Project Structure

```text
src
├── app
│   ├── router
│   ├── stores
│   └── types
│
├── components
│   ├── ai
│   ├── editor
│   ├── layout
│   ├── sidebar
│   └── terminal
│
├── services
│   ├── ai.ts
│   ├── context.ts
│   └── prompt.ts
│
├── views
│   └── WorkspaceView.vue
│
└── main.ts

src-tauri
├── src
│   ├── lib.rs
│   └── main.rs
│
├── capabilities
└── tauri.conf.json
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/saiyaner/ai-editor.git

cd ai-editor
```

### Install Dependencies

```bash
npm install
```

### Start Ollama

```bash
ollama serve
```

### Pull Model

```bash
ollama pull qwen2.5-coder:7b
```

or

```bash
ollama pull deepseek-coder:6.7b
```

### Run Development Mode

```bash
npm run tauri dev
```

---

## Current Implemented Features

- [x] Monaco Editor
- [x] File Explorer
- [x] Open Folder
- [x] Multi Tabs
- [x] Dirty Indicator
- [x] AI Chat
- [x] Explain Selection
- [x] Fix Code
- [x] Context Injection
- [x] Markdown Rendering
- [x] Local AI via Ollama

---

## Roadmap

### Phase 1

- [x] Open Folder
- [x] Monaco Editor
- [x] AI Chat
- [x] Explain Code

### Phase 2

- [ ] Apply AI Changes
- [ ] Refactor Code
- [ ] Generate Tests
- [ ] Explain Errors
- [ ] Workspace Context

### Phase 3

- [ ] Integrated Terminal
- [ ] Agent Mode
- [ ] Multi-file Editing
- [ ] Code Actions
- [ ] AI Workspace Search

### Phase 4

- [ ] Git Integration
- [ ] AI Commit Messages
- [ ] Project Generation
- [ ] Autonomous Coding Agent

---

## Screenshots

Coming Soon.

---

## License

MIT License

---

## Author

Developed by Angga using Vue, Rust, Tauri, Monaco Editor, and Ollama.
