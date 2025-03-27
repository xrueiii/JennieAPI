# Jennie API – Master in APIs

This VS Code extension helps developers integrate and explore backend APIs more easily by leveraging OpenAPI specifications and AI-assisted suggestions. It allows you to generate OpenAPI documentation from source code, suggest relevant API endpoints based on context, and even auto-generate and refine fetch code snippets.

---

## ✨ Features

- 🔍 Auto-detects API usage intent in code.
- 💡 Suggests relevant endpoints from `api.json`.
- ⚙️ Generates fetch code snippets using OpenAPI schema.
- 🧠 Refines code using Azure OpenAI (GPT).
- 📄 Converts Java/TypeScript controller files into OpenAPI JSON.
- 🖼️ Webview support (optional UI features).

---

## 📁 Project Structure
Main structure is shown below:
```yaml
icon/
src/
├── extension.ts               # Entry point
├── commands/                  # VS Code commands
│   ├── generateApiJson.ts     # Generate OpenAPI from controllers
│   ├── suggestApiEndpoint.ts  # Suggest and insert API code
│   ├── openTestWeb.ts         # Open the panel for API endpoint testing
├── core/                      # Logic modules
│   ├── openai.ts              # Azure OpenAI integration
│   ├── apiDocs.ts             # Read + cache api.json
│   ├── apiUtils.ts            # NLP and API match logic
├── codegen/                   # Code generation helpers
│   ├── fetchSnippet.ts        # Generate fetch snippet from schema
│   └── refineCode.ts          # LLM refinement
├── utils/
│   └── file.ts                # File system utilities
├── types/
│   └── index.ts               # Type definitions 

```

---

## ⚙️ Setup

1. **Clone this repository:**

```bash
https://github.com/xrueiii/JennieAPI.git
cd JennieAPI
```
2. **Create your .env file:** \
  Copy the example file and fill in your own values:
```bash
  cp .env.example .env
```
Then edit .env and provide your Azure OpenAI credentials:
```ini
AZURE_OPENAI_FULL_URL=https://<your-endpoint>/openai/deployments/<deployment>/chat/completions?api-version=2025-01-01-preview
AZURE_OPENAI_API_KEY=your-api-key-here
```

## ▶️ Run the Extension

1. Open this folder in VS Code

2. Press F5 to launch the extension in a new Extension Development Host window

No need to run any extra servers — everything is local.

## 🧪 Available Commands

- `JennieAPI: Generate API JSON from Folder`  
  → Converts Java/TS backend controllers into OpenAPI paths

- `JennieAPI: Suggest API Endpoints`  
  → Suggests relevant endpoints based on nearby code

- `JennieAPI: Open API Connector`  
  → Opens a visual panel for testing API endpoints

---

### 🧭 How to Use Each Command

1. **Generate API JSON from Folder**  
   Right-click on your API folder in the Explorer panel, then select `JennieAPI: Generate API JSON from Folder`. This will scan your Java or TypeScript controller files and convert them into OpenAPI-compliant `api.json` documentation.

2. **Suggest API Endpoints**  
   While editing code, type your desired API function name. Then, right-click at the end of the line (or double-tap on Mac), and select `JennieAPI: Suggest API Endpoints`. Jennie will automatically detect your intent, find the most relevant API, and insert a fully connected `fetch()` function with minimal effort.

3. **Open API Connector**  
   Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) to open the VS Code command palette. Search for `JennieAPI: Open API Connector` and select it. This will open a custom panel for testing your API endpoints directly within VS Code.


## 🧠 Requirements
- Azure OpenAI deployment with Chat Completion endpoint

- `.env` file with valid credentials

- Java or TypeScript backend with REST-style controllers

- (Optional) OpenAPI-compatible server responses

## 🛠 Development Notes
- Written in TypeScript with full type safety

- Uses dynamic import of `node-fetch` for compatibility

- LLM prompt formatting handled cleanly via   `utils/  file.ts`

- API similarity matching via keyword extraction + cosine similarity

- Snippet generation respects schema and inserts `fetch()`-style code