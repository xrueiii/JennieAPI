// src/core/apiUtils.ts

import * as vscode from 'vscode';
import { readApiDocs } from './apiDocs';
import { ApiEndpoint } from '../types';

/**
 * Extract keywords from a code snippet
 */
export function extractKeywords(text: string): string[] {
  const cleanLine = text.replace(/[(){};=]/g, ' ');

  const words = cleanLine
    .split(/\s+/)
    .filter(word => word.length > 2 && !/^[0-9]+$/.test(word))
    .map(word => word.toLowerCase())
    .filter(word => !isStopWord(word));

  const entities = extractEntities(text);
  return [...new Set([...words, ...entities])];
}

/**
 * Basic stop word filtering
 */
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'const', 'let', 'var', 'function', 'async', 'await', 'return', 'import', 'export',
    'from', 'require', 'module', 'this', 'class', 'interface', 'type', 'enum',
    'true', 'false', 'null', 'undefined', 'new', 'try', 'catch', 'if', 'else', 'for', 'while'
  ]);
  return stopWords.has(word);
}

/**
 * Extract camelCase, PascalCase, snake_case and kebab-case terms from text
 */
function extractEntities(text: string): string[] {
  const entities: string[] = [];

  const camelCaseRegex = /([A-Z]?[a-z]+)(?=[A-Z])/g;
  let match;
  while ((match = camelCaseRegex.exec(text)) !== null) {
    entities.push(match[1].toLowerCase());
  }

  const snakeCaseWords = text.split('_').filter(w => w.length > 2);
  entities.push(...snakeCaseWords.map(w => w.toLowerCase()));

  const kebabCaseWords = text.split('-').filter(w => w.length > 2);
  entities.push(...kebabCaseWords.map(w => w.toLowerCase()));

  return [...new Set(entities)];
}

/**
 * Cosine similarity between keyword list and API description
 */
function calculateCosineSimilarity(keywords: string[], apiText: string): number {
  const apiTokens = apiText.toLowerCase().split(/\W+/).filter(word =>
    word.length > 2 && !isStopWord(word)
  );

  const freq = (list: string[]) => {
    const map = new Map<string, number>();
    for (const word of list) {
      map.set(word, (map.get(word) || 0) + 1);
    }
    return map;
  };

  const keywordMap = freq(keywords);
  const apiMap = freq(apiTokens);
  const terms = new Set([...keywordMap.keys(), ...apiMap.keys()]);

  let dot = 0, mag1 = 0, mag2 = 0;
  for (const term of terms) {
    const a = keywordMap.get(term) || 0;
    const b = apiMap.get(term) || 0;
    dot += a * b;
    mag1 += a * a;
    mag2 += b * b;
  }

  if (mag1 === 0 || mag2 === 0) {return 0;}
  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Find relevant APIs using cosine similarity against nearby code context
 */
export async function findRelevantApis(currentCode: string, lineNumber: number): Promise<{
  path: string;
  method: string;
  description: string;
  similarity: number;
}[]> {
  const apiDocs = await readApiDocs();
  if (!apiDocs) {return [];}

  const document = vscode.window.activeTextEditor?.document;
  if (!document) {return [];}

  const startLine = Math.max(0, lineNumber - 5);
  const endLine = Math.min(document.lineCount - 1, lineNumber + 5);

  let context = '';
  for (let i = startLine; i <= endLine; i++) {
    context += document.lineAt(i).text + ' ';
  }

  const currentLine = document.lineAt(lineNumber).text;
  const keywords = [
    ...extractKeywords(currentLine),
    ...extractKeywords(currentLine), // weighted
    ...extractKeywords(context)
  ];

  const results: {
    path: string;
    method: string;
    description: string;
    similarity: number;
  }[] = [];

  for (const [path, pathObj] of Object.entries(apiDocs.paths)) {
    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      const endpoint: ApiEndpoint|undefined = pathObj[method];
      if (!endpoint){continue;}

      const apiText = [
        path,
        method,
        endpoint.summary || '',
        endpoint.description || '',
        endpoint.operationId || '',
        ...(endpoint.parameters || []).map(p => p.name || ''),
        ...(endpoint.requestBody?.content ? Object.keys(endpoint.requestBody.content) : [])
      ].join(' ');

      const sim = calculateCosineSimilarity(keywords, apiText);
      if (sim > 0.1) {
        results.push({
          path,
          method,
          description: endpoint.summary || path,
          similarity: sim
        });
      }
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}
