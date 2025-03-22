import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

// ✅ 載入 .env 設定（建議加到 .vscodeignore）
dotenv.config();

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

// ✅ 使用環境變數（記得設定 .env）
const url = process.env.AZURE_OPENAI_FULL_URL!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;

async function generateResponse(prompt: string) {
  const headers = {
    "Content-Type": "application/json",
    "api-key": apiKey
  };

  const messages: Message[] = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: prompt }
  ];

  const body = {
    messages,
    max_tokens: 100,
    temperature: 1,
    top_p: 1
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

	if(response.ok){
		const data = await response.json();	
		console.log(data);
		// if (data.choices?.[0]?.message?.content) {
		// 	return data.choices[0].message.content;
		// } else {
		// 	console.warn("⚠️ Unexpected Azure response:", data);
		// 	return "⚠️ No response received from Azure OpenAI.";
		// }
		return data;
		
	}
	
  } catch (err) {
    console.error("❌ Azure call failed:", err);
    return "❌ Error occurred while calling Azure OpenAI.";
  }
}

export function activate(context: vscode.ExtensionContext) {

  // ✅ 保留 WebView command
  const openWebviewCmd = vscode.commands.registerCommand('jennieapi.openWebview', () => {
    vscode.window.showInformationMessage('JennieAPI WebView UI 仍然存在喔！');
  });


  const testapiCmd = vscode.commands.registerCommand('jennieapi.testapiCmd', async () => {
    const headers = {
      "Content-Type": "application/json",
      "api-key": apiKey
    };
  
    const messages: Message[] = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "hi" }
    ];
  
    const body = {
      messages,
      max_tokens: 100,
      temperature: 1,
      top_p: 1
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
  
      const data = await response.json();
      // console.log(data);
      // vscode.window.showInformationMessage(String(data));
      // if (data.choices?.[0]?.message?.content) {
      //   return data.choices[0].message.content;
      // } else {
      //   console.warn("⚠️ Unexpected Azure response:", data);
      //   return "⚠️ No response received from Azure OpenAI.";
      // }
    } catch (err) {
      console.error("❌ Azure call failed:", err);
      return "❌ Error occurred while calling Azure OpenAI.";
    }
	  
  });

  
  // ✅ 插入 API 程式碼選單
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

export function deactivate() {}
