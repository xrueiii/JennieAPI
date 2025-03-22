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
// 📁 src/extension.ts
const vscode = __importStar(require("vscode"));
function activate(context) {
    // ✅ WebView command (if still needed)
    const openWebviewCmd = vscode.commands.registerCommand('jennieapi.openWebview', () => {
        vscode.window.showInformationMessage('JennieAPI WebView UI 仍然存在喔！');
    });
    // ✅ 新增：右鍵插入 API 程式碼
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
    context.subscriptions.push(openWebviewCmd, insertApiCodeCmd);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map