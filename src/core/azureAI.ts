// src/core/openai.ts

import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import type { RequestInit as NodeFetchRequestInit } from 'node-fetch';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });


type OpenAIResponse = {
  choices?: { message: { content: string } }[];
  error?: { message: string };
};

const url = process.env.AZURE_OPENAI_FULL_URL || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";

// Dynamically import node-fetch for compatibility
const fetch = async (url: string, init?: NodeFetchRequestInit) => {
  const mod = await import('node-fetch');
  return mod.default(url, init);
};

/**
 * Call Azure OpenAI Chat Completion API
 * @param prompt Prompt string
 * @returns Response text
 */
export async function generateResponse(prompt: string): Promise<string> {
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

    const data = await response.json() as OpenAIResponse;

    if (!response.ok) {
      vscode.window.showErrorMessage(`⚠️ Azure API Error: ${data.error?.message || 'Unknown error'}`);
      return "API error.";
    }

    return data.choices?.[0]?.message?.content || "⚠️ No message content.";
  } catch (err: any) {
    console.error("❌ Azure call failed:", err);
    vscode.window.showErrorMessage("❌ Error calling Azure API: " + err.message);
    return "❌ API call failed.";
  }
}
