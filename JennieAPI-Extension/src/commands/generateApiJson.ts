// src/commands/generateApiJson.ts

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { generateResponse } from '../core/azureAI';
import { buildOpenApiPrompt, getAllSourceFiles } from '../utils/file';
import { ApiDoc } from '../types';

export function registerGenerateApiJsonCommand(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand(
    'jennieapi.generateApiJson',
    async (uri: vscode.Uri) => {
      const folderPath = uri?.fsPath;
      if (!folderPath) {
        vscode.window.showErrorMessage('❌ Please select a folder to generate API documentation.');
        return;
      }

      vscode.window.showInformationMessage(`📁 Scanning folder: ${folderPath}`);

      const sourceFiles = getAllSourceFiles(folderPath);
      const apiDoc: ApiDoc = {
        openapi: '3.0.0',
        info: {
          title: 'API Documentation',
          description: 'Auto-generated from controller files via LLM',
          version: '1.0.0'
        },
        servers: [{ url: 'http://localhost:3001' }],
        paths: {}
      };

      for (const filePath of sourceFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const isJava = filePath.endsWith('.java') && content.includes('@RestController');
        const isTs = filePath.endsWith('.ts');

        if (!isJava && !isTs) {continue;}

        try {
          const prompt = buildOpenApiPrompt(path.basename(filePath), content);
          vscode.window.showInformationMessage(`Generating API docs for ${path.basename(filePath)}...`);
          const raw = await generateResponse(prompt);

          const cleaned = raw
            .replace(/```(json)?/g, '')
            .replace(/^.*?{/, '{')
            .replace(/}[^}]*$/, '}')
            .trim();

          const parsed = JSON.parse(cleaned);
          Object.assign(apiDoc.paths, parsed);

          vscode.window.showInformationMessage(`✅ Successfully parsed: ${path.basename(filePath)}`);
        } catch (err: any) {
          vscode.window.showWarningMessage(`⚠️ Failed to process ${path.basename(filePath)}: ${err.message}`);
        }
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('❌ Cannot determine workspace root.');
        return;
      }

      const outputPath = path.join(workspaceFolder, 'api.json');
      fs.writeFileSync(outputPath, JSON.stringify(apiDoc, null, 2), 'utf-8');

      vscode.window.showInformationMessage(`✅ API documentation saved to: ${outputPath}`);
      const document = await vscode.workspace.openTextDocument(outputPath);
      vscode.window.showTextDocument(document);
    }
  );

  context.subscriptions.push(command);
}
