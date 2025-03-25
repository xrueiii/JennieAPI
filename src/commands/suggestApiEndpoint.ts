// src/commands/suggestApiEndpoint.ts

import * as vscode from 'vscode';
import { findRelevantApis } from '../core/apiUtils';
import { generateFetchCodeForApi } from '../codegen/fetchSnippet';
import { generateResponse } from '../core/azureAI';

/**
 * Utility to pause execution for given milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Register command to suggest relevant API endpoints based on code context
 */
export function registerSuggestApiEndpointCommand(context: vscode.ExtensionContext) {
  const suggestCommand = vscode.commands.registerCommand(
    'jennieapi.suggestApiEndpoints',
    async (documentArg?: vscode.TextDocument, lineArg?: number) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
      }

      const document = documentArg || editor.document;
      const line = typeof lineArg === 'number' ? lineArg : editor.selection.active.line;

      const startLine = Math.max(0, line - 5);
      const endLine = Math.min(document.lineCount - 1, line + 5);

      let contextCode = '';
      for (let i = startLine; i <= endLine; i++) {
        contextCode += document.lineAt(i).text + '\n';
      }

      const relevantApis = await findRelevantApis(contextCode, line);

      if (relevantApis.length === 0) {
        vscode.window.showInformationMessage('No relevant API endpoints found');
        return;
      }

      const items = relevantApis.map(api => ({
        label: `${api.method.toUpperCase()} ${api.path}`,
        description: api.description,
        detail: `Relevance: ${Math.round(api.similarity * 100)}%`,
        api
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select an API endpoint to insert fetch code'
      });

      if (!selected){return;}

      let snippet: vscode.SnippetString = new vscode.SnippetString();

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "⚙️ Generating API function...",
          cancellable: false,
        },
        async () => {
          await sleep(3000);
          snippet = await generateFetchCodeForApi(selected.api.path, selected.api.method);
          await editor.insertSnippet(snippet, editor.selection.active);
        }
      );

      const fullText = editor.document.getText();
      const insertedCode = snippet.value;
      const prompt = `
Based on the code generated: ${insertedCode},

and the code user just wrote: ${fullText}

Please must use **fetch** function to write the api function, when you fetch please add the http://localhost:3001/api/ in the front of the url.

**Don't add any new import, don't use "return" in the code you generate**

Use English only!!!

⚠️ Please help me refine the API function the insertedCode is located, **do not modify the original code the user just wrote**.

Please intelligently integrate the inserted code into the original code. If there are any missing parameters or properties (such as in the request body), make reasonable assumptions to fill them in. Ensure that the final code is complete, properly formatted, and executable.

⚠️ Important: Your response must contain only the final code, without any explanations, comments, or code block markers like \`\`\`.
      `;

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "🧠 Refining API function...",
          cancellable: false,
        },
        async () => {
          const newCode = await generateResponse(prompt);

          if (newCode) {
            const entireRange = new vscode.Range(
              editor.document.positionAt(0),
              editor.document.positionAt(fullText.length)
            );

            await editor.edit(editBuilder => {
              editBuilder.replace(entireRange, newCode);
            });

            vscode.window.showInformationMessage("✅ Successfully added and refined the API function!");
          } else {
            vscode.window.showErrorMessage("❌ LLM failed to generate refined code.");
          }
        }
      );
    }
  );

  context.subscriptions.push(suggestCommand);
}