"use strict";
// src/commands/generateApiJson.ts
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
exports.registerGenerateApiJsonCommand = registerGenerateApiJsonCommand;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const azureAI_1 = require("../core/azureAI");
const file_1 = require("../utils/file");
function registerGenerateApiJsonCommand(context) {
    const command = vscode.commands.registerCommand('jennieapi.generateApiJson', async (uri) => {
        const folderPath = uri?.fsPath;
        if (!folderPath) {
            vscode.window.showErrorMessage('❌ Please select a folder to generate API documentation.');
            return;
        }
        vscode.window.showInformationMessage(`📁 Scanning folder: ${folderPath}`);
        const sourceFiles = (0, file_1.getAllSourceFiles)(folderPath);
        const apiDoc = {
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
            if (!isJava && !isTs) {
                continue;
            }
            try {
                const prompt = (0, file_1.buildOpenApiPrompt)(path.basename(filePath), content);
                vscode.window.showInformationMessage(`Generating API docs for ${path.basename(filePath)}...`);
                const raw = await (0, azureAI_1.generateResponse)(prompt);
                const cleaned = raw
                    .replace(/```(json)?/g, '')
                    .replace(/^.*?{/, '{')
                    .replace(/}[^}]*$/, '}')
                    .trim();
                const parsed = JSON.parse(cleaned);
                Object.assign(apiDoc.paths, parsed);
                vscode.window.showInformationMessage(`✅ Successfully parsed: ${path.basename(filePath)}`);
            }
            catch (err) {
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
    });
    context.subscriptions.push(command);
}
//# sourceMappingURL=generateApiJson.js.map