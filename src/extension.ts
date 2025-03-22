// 📁 src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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

export function deactivate() {}
