"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const dotenv = __importStar(require("dotenv"));
// ✅ Load .env variables
dotenv.config();
const url = "https://ai-wayneyang70211738ai298523890930.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview";
const apiKey = "FqKvwsq0fsCLYAUG1HPCuxqa2sWoKgUpeBfYvQ2XGAsDJez6ME0uJQQJ99BCACHYHv6XJ3w3AAAAACOGTCQx";
// ✅ Dynamic import of node-fetch for CommonJS compatibility
const fetch = async (url, init) => {
    const mod = await import('node-fetch');
    return mod.default(url, init);
};
// ✅ Reusable function for calling Azure OpenAI
async function generateResponse(prompt) {
    if (!url || !apiKey) {
        vscode.window.showErrorMessage("❌ Missing AZURE_OPENAI_FULL_URL or AZURE_OPENAI_API_KEY in .env");
        return "Environment variables missing.";
    }
    const headers = {
        "Content-Type": "application/json",
        "api-key": apiKey
    };
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
    ];
    const requestBody = {
        messages,
        max_tokens: 100,
        temperature: 1,
        top_p: 1
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody)
        });
        const data = (await response.json());
        if (!response.ok) {
            vscode.window.showErrorMessage(`⚠️ Azure API Error: ${data.error?.message || 'Unknown error'}`);
            return "API error.";
        }
        const content = data.choices?.[0]?.message?.content;
        return content || "⚠️ No message content.";
    }
    catch (err) {
        console.error("❌ Azure call failed:", err);
        vscode.window.showErrorMessage("❌ Error calling Azure API: " + err.message);
        return "❌ API call failed.";
    }
}
function activate(context) {
    const openWebviewCmd = vscode.commands.registerCommand('jennieapi.openWebview', () => {
        vscode.window.showInformationMessage('JennieAPI WebView UI 仍然存在喔！');
    });
    const testapiCmd = vscode.commands.registerCommand('jennieapi.testapiCmd', async () => {
        const result = await generateResponse("hi");
        vscode.window.showInformationMessage(result);
    });
    const insertApiCodeCmd = vscode.commands.registerCommand('jennieapi.insertApiCode', async () => {
        const apis = [
            {
                label: '🔍 Azure OpenAI: Chat Completion',
                description: 'POST /chat/completions with gpt-3.5-turbo',
                snippet: `fetch("https://your-resource.openai.azure.com/openai/deployments/gpt35/chat/completions?api-version=2023-06-01-preview", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Hello!" }
    ],
    temperature: 0.7
  })
})
.then(res => res.json())
.then(data => console.log(data));`
            },
            {
                label: '📦 Sample: Get User by ID',
                description: 'GET /users/:id 範例',
                snippet: `fetch("https://api.example.com/users/123", {
  method: "GET"
})
.then(res => res.json())
.then(data => console.log(data));`
            }
        ];
        const pick = await vscode.window.showQuickPick(apis, {
            placeHolder: '請選擇要插入的 API 程式碼'
        });
        if (pick) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, pick.snippet);
                });
            }
        }
    });
    context.subscriptions.push(openWebviewCmd, insertApiCodeCmd, testapiCmd);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map