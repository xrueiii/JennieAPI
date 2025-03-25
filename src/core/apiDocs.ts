// src/core/apiDocs.ts

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ApiDoc } from '../types';

let apiDocsCache: ApiDoc | null = null;

/**
 * Read and cache the OpenAPI documentation (api.json or similar)
 */
export async function readApiDocs(): Promise<ApiDoc | null> {
  if (apiDocsCache){return apiDocsCache;}

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder is open.');
    return null;
  }

  const possibleFiles = ['api.json', 'openapi.json', 'swagger.json', 'api-docs.json'];
  let apiDocPath = '';

  for (const file of possibleFiles) {
    const fullPath = path.join(workspaceFolders[0].uri.fsPath, file);
    if (fs.existsSync(fullPath)) {
      apiDocPath = fullPath;
      break;
    }
  }

  if (!apiDocPath) {
    return null;
  }

  try {
    const content = fs.readFileSync(apiDocPath, 'utf-8');
    apiDocsCache = JSON.parse(content) as ApiDoc;
    return apiDocsCache;
  } catch (error) {
    vscode.window.showErrorMessage('Error reading or parsing API documentation file.');
    return null;
  }
}
