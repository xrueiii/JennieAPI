"use strict";
// src/core/apiDocs.ts
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
exports.readApiDocs = readApiDocs;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let apiDocsCache = null;
/**
 * Read and cache the OpenAPI documentation (api.json or similar)
 */
async function readApiDocs() {
    if (apiDocsCache) {
        return apiDocsCache;
    }
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
        apiDocsCache = JSON.parse(content);
        return apiDocsCache;
    }
    catch (error) {
        vscode.window.showErrorMessage('Error reading or parsing API documentation file.');
        return null;
    }
}
//# sourceMappingURL=apiDocs.js.map