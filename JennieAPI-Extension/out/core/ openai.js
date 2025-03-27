"use strict";
// src/core/openai.ts
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
exports.generateResponse = generateResponse;
const vscode = __importStar(require("vscode"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const url = process.env.AZURE_OPENAI_FULL_URL || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
// Dynamically import node-fetch for compatibility
const fetch = async (url, init) => {
    const mod = await import('node-fetch');
    return mod.default(url, init);
};
/**
 * Call Azure OpenAI Chat Completion API
 * @param prompt Prompt string
 * @returns Response text
 */
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
        max_tokens: 5000,
        temperature: 1,
        top_p: 1
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        if (!response.ok) {
            vscode.window.showErrorMessage(`⚠️ Azure API Error: ${data.error?.message || 'Unknown error'}`);
            return "API error.";
        }
        return data.choices?.[0]?.message?.content || "⚠️ No message content.";
    }
    catch (err) {
        console.error("❌ Azure call failed:", err);
        vscode.window.showErrorMessage("❌ Error calling Azure API: " + err.message);
        return "❌ API call failed.";
    }
}
//# sourceMappingURL=%20openai.js.map