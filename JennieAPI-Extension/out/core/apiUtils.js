"use strict";
// src/core/apiUtils.ts
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
exports.extractKeywords = extractKeywords;
exports.findRelevantApis = findRelevantApis;
const vscode = __importStar(require("vscode"));
const apiDocs_1 = require("./apiDocs");
/**
 * Extract keywords from a code snippet
 */
function extractKeywords(text) {
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
function isStopWord(word) {
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
function extractEntities(text) {
    const entities = [];
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
function calculateCosineSimilarity(keywords, apiText) {
    const apiTokens = apiText.toLowerCase().split(/\W+/).filter(word => word.length > 2 && !isStopWord(word));
    const freq = (list) => {
        const map = new Map();
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
    if (mag1 === 0 || mag2 === 0) {
        return 0;
    }
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}
/**
 * Find relevant APIs using cosine similarity against nearby code context
 */
async function findRelevantApis(currentCode, lineNumber) {
    const apiDocs = await (0, apiDocs_1.readApiDocs)();
    if (!apiDocs) {
        return [];
    }
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return [];
    }
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
    const results = [];
    for (const [path, pathObj] of Object.entries(apiDocs.paths)) {
        for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
            const endpoint = pathObj[method];
            if (!endpoint) {
                continue;
            }
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
//# sourceMappingURL=apiUtils.js.map