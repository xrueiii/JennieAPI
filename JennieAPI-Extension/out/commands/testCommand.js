"use strict";
// src/commands/testCommand.ts
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
exports.registerOpenWebCommand = registerOpenWebCommand;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function registerOpenWebCommand(context) {
    const openWebviewCmd = vscode.commands.registerCommand('jennieapi.openWebview', () => {
        const panel = vscode.window.createWebviewPanel('jennieWebview', 'Jennie WebView', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media')), vscode.Uri.file(path.join(context.extensionPath, 'icon'))]
        });
        // 圖片路徑轉換為可用於 WebView 的 URI
        const lightIcon = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'icon', 'light_theme.png')));
        const darkIcon = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'icon', 'dark_theme.png')));
        const button1 = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'icon', 'button1.png')));
        const button2 = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'icon', 'button2.png')));
        // 載入 HTML 並替換 {{...}} 佔位符
        let htmlContent = fs.readFileSync(path.join(context.extensionPath, 'media', 'webview.html'), 'utf8');
        htmlContent = htmlContent
            .replace(/{{LIGHT_ICON}}/g, lightIcon.toString()) // <-- note the /g flag
            .replace('{{DARK_ICON}}', darkIcon.toString())
            .replace(/{{BUTTON1}}/g, button1.toString())
            .replace(/{{BUTTON2}}/g, button2.toString());
        panel.webview.html = htmlContent;
    });
    context.subscriptions.push(openWebviewCmd);
}
//# sourceMappingURL=testCommand.js.map