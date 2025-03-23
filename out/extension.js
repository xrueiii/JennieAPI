"use strict";
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
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode_1 = require("vscode"); // 在最上方補這行
// ✅ Load .env variables
dotenv.config();
const url = "https://ai-wayneyang70211738ai298523890930.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview";
const apiKey = "FqKvwsq0fsCLYAUG1HPCuxqa2sWoKgUpeBfYvQ2XGAsDJez6ME0uJQQJ99BCACHYHv6XJ3w3AAAAACOGTCQx";
// ✅ Dynamic import of node-fetch for CommonJS compatibility
const fetch = async (url, init) => {
    const mod = await import('node-fetch');
    return mod.default(url, init);
};
// ✅ Reusable function for calling Azure OpenAI
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
        max_tokens: 300,
        temperature: 1,
        top_p: 1
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody)
        });
        const data = (await response.json());
        if (!response.ok) {
            vscode.window.showErrorMessage(`⚠️ Azure API Error: ${data.error?.message || 'Unknown error'}`);
            return "API error.";
        }
        const content = data.choices?.[0]?.message?.content;
        return content || "⚠️ No message content.";
    }
    catch (err) {
        console.error("❌ Azure call failed:", err);
        vscode.window.showErrorMessage("❌ Error calling Azure API: " + err.message);
        return "❌ API call failed.";
    }
}
// Function to read API documentation with caching
let apiDocsCache = null;
async function readApiDocs() {
    // Return cached version if available
    if (apiDocsCache) {
        return apiDocsCache;
    }
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace opened.");
        return null;
    }
    // Try multiple possible filenames for API docs
    const possibleFiles = ['api.json', 'openapi.json', 'swagger.json', 'api-docs.json'];
    let apiDocPath = '';
    for (const filename of possibleFiles) {
        const testPath = path.join(workspaceFolders[0].uri.fsPath, filename);
        if (fs.existsSync(testPath)) {
            apiDocPath = testPath;
            break;
        }
    }
    if (!apiDocPath) {
        vscode.window.showErrorMessage("API documentation file not found. Looked for: " + possibleFiles.join(', '));
        return null;
    }
    try {
        const fileContent = fs.readFileSync(apiDocPath, 'utf-8');
        apiDocsCache = JSON.parse(fileContent);
        return apiDocsCache;
    }
    catch (error) {
        vscode.window.showErrorMessage("Error reading API documentation file.");
        return null;
    }
}
// Function to get API paths from documentation
async function getApiPaths() {
    const apiDocs = await readApiDocs();
    if (!apiDocs) {
        return [];
    }
    return Object.keys(apiDocs.paths);
}
// Enhance keyword extraction with NLP-like techniques
function extractKeywords(text) {
    // Remove common syntax elements
    const cleanLine = text.replace(/[(){};=]/g, ' ');
    // Split into words
    const words = cleanLine.split(/\s+/)
        .filter(word => word.length > 2) // Filter out very short words
        .filter(word => !/^[0-9]+$/.test(word)) // Filter out numbers
        .map(word => word.toLowerCase())
        .filter(word => !isStopWord(word));
    // Extract potential entities and noun phrases
    const entities = extractEntities(text);
    return [...new Set([...words, ...entities])];
}
// Simple stop words filter
function isStopWord(word) {
    const stopWords = new Set([
        'const', 'let', 'var', 'function', 'async', 'await', 'return', 'import', 'export',
        'from', 'require', 'module', 'this', 'class', 'interface', 'type', 'enum',
        'true', 'false', 'null', 'undefined', 'new', 'try', 'catch', 'if', 'else', 'for', 'while'
    ]);
    return stopWords.has(word);
}
// Extract potential entities (camelCase, PascalCase, snake_case, etc.)
function extractEntities(text) {
    const entities = [];
    // Extract camelCase or PascalCase words
    const camelCaseRegex = /([A-Z]?[a-z]+)(?=[A-Z])/g;
    let match;
    while ((match = camelCaseRegex.exec(text)) !== null) {
        entities.push(match[1].toLowerCase());
    }
    // Extract words from snake_case
    const snakeCaseWords = text.split('_').filter(word => word.length > 2);
    entities.push(...snakeCaseWords.map(word => word.toLowerCase()));
    // Extract words from kebab-case
    const kebabCaseWords = text.split('-').filter(word => word.length > 2);
    entities.push(...kebabCaseWords.map(word => word.toLowerCase()));
    return [...new Set(entities)];
}
// Enhanced function to calculate similarity between text and API using cosine similarity
function calculateCosineSimilarity(keywords, apiText) {
    // Tokenize API text
    const apiTokens = apiText.toLowerCase().split(/\W+/).filter(word => word.length > 2 && !isStopWord(word));
    // Create term frequency maps
    const keywordsMap = new Map();
    const apiMap = new Map();
    // Fill keyword frequency map
    keywords.forEach(keyword => {
        keywordsMap.set(keyword, (keywordsMap.get(keyword) || 0) + 1);
    });
    // Fill API text frequency map
    apiTokens.forEach(token => {
        apiMap.set(token, (apiMap.get(token) || 0) + 1);
    });
    // Get all unique terms
    const allTerms = new Set([...keywordsMap.keys(), ...apiMap.keys()]);
    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let keywordsMagnitude = 0;
    let apiMagnitude = 0;
    allTerms.forEach(term => {
        const keywordFreq = keywordsMap.get(term) || 0;
        const apiFreq = apiMap.get(term) || 0;
        dotProduct += keywordFreq * apiFreq;
        keywordsMagnitude += keywordFreq * keywordFreq;
        apiMagnitude += apiFreq * apiFreq;
    });
    // Calculate cosine similarity
    keywordsMagnitude = Math.sqrt(keywordsMagnitude);
    apiMagnitude = Math.sqrt(apiMagnitude);
    if (keywordsMagnitude === 0 || apiMagnitude === 0) {
        return 0;
    }
    return dotProduct / (keywordsMagnitude * apiMagnitude);
}
// Enhanced function to find relevant APIs using cosine similarity
async function findRelevantApis(currentCode, lineNumber) {
    const apiDocs = await readApiDocs();
    if (!apiDocs) {
        return [];
    }
    // Extract context from surrounding code (not just the current line)
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return [];
    }
    // Get a window of code around the current line for context
    const startLine = Math.max(0, lineNumber - 5);
    const endLine = Math.min(document.lineCount - 1, lineNumber + 5);
    let contextCode = '';
    for (let i = startLine; i <= endLine; i++) {
        contextCode += document.lineAt(i).text + ' ';
    }
    // Extract keywords from both current line and context
    const currentLineText = document.lineAt(lineNumber).text;
    const currentLineKeywords = extractKeywords(currentLineText);
    const contextKeywords = extractKeywords(contextCode);
    // Combine with higher weight for current line keywords
    const combinedKeywords = [...currentLineKeywords, ...currentLineKeywords, ...contextKeywords];
    // Match keywords against API paths and descriptions
    const matches = [];
    for (const [path, pathInfo] of Object.entries(apiDocs.paths)) {
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        for (const method of methods) {
            const endpoint = pathInfo[method];
            if (!endpoint) {
                continue;
            }
            // Build a rich text representation of this API endpoint
            const apiText = [
                path,
                method,
                endpoint.summary || '',
                endpoint.description || '',
                endpoint.operationId || '',
                // Include any parameter names
                ...(endpoint.parameters || []).map((p) => p.name || ''),
                // Include any request body properties if available
                ...(endpoint.requestBody?.content ?
                    Object.keys(endpoint.requestBody.content).map(contentType => contentType) : []),
            ].join(' ');
            // Calculate similarity between keywords and API text
            const similarity = calculateCosineSimilarity(combinedKeywords, apiText);
            if (similarity > 0.1) { // threshold to consider it a match
                matches.push({
                    path,
                    method,
                    description: endpoint.summary || path,
                    similarity
                });
            }
        }
    }
    // Sort by similarity score and return top matches
    return matches
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
}
// Use LLM to determine if the current code is attempting to make an API call
async function isApiFetchIntent(code) {
    // First use a rule-based approach for common patterns
    const fetchPatterns = [
        /fetch\s*\(/i,
        /api\./i,
        /\.get\s*\(/i,
        /\.post\s*\(/i,
        /\.put\s*\(/i,
        /\.delete\s*\(/i,
        /\.patch\s*\(/i,
        /\.then\s*\(/i,
        /axios/i,
        /http/i,
        /request\s*\(/i,
        /response/i,
        /url/i,
        /endpoint/i,
        /data\s*=/i,
        /json/i,
        /await/i,
        /\/\/ get .* data/i,
        /\/\/ fetch/i,
        /\/\/ call api/i,
        /\/\/ send/i
    ];
    // Check for common patterns first
    if (fetchPatterns.some(pattern => pattern.test(code))) {
        return true;
    }
    // For more complex cases or comments, we could use the LLM
    // This is commented out to avoid unnecessary API calls, but can be enabled
    // for more sophisticated detection
    /*
    // Ask LLM if this code is intending to fetch data
    const prompt = `Given this code snippet:
    \`\`\`
    ${code}
    \`\`\`
    
    Is this code likely trying to make an API call, fetch data, or interact with a web service?
    Answer only "yes" or "no".`;
    
    try {
      const response = await generateResponse(prompt);
      return response.toLowerCase().includes('yes');
    } catch (error) {
      // Fallback to pattern-based detection if LLM fails
      return fetchPatterns.some(pattern => pattern.test(code));
    }
    */
    return false;
}
// Function to generate fetch code for a specific API
async function generateFetchCodeForApi(apiPath, method = 'get') {
    const apiDocs = await readApiDocs();
    if (!apiDocs || !apiDocs.paths[apiPath]) {
        return new vscode_1.SnippetString(generateDefaultFetchCode(apiPath, method).trim());
    }
    const pathInfo = apiDocs?.paths[apiPath];
    const endpoint = pathInfo?.[method];
    let snippetCode = '';
    let i = 1;
    // 預設為 application/json
    const contentType = endpoint?.requestBody?.content?.['application/json'] ? 'application/json' : 'application/json';
    // 如果是 POST/PUT 等含 body 的方法
    if (['post', 'put', 'patch'].includes(method)) {
        const schema = endpoint?.requestBody?.content?.['application/json']?.schema;
        let bodyProps = '';
        if (schema && schema.properties) {
            for (const key of Object.keys(schema.properties)) {
                bodyProps += `${key}: \${${i++}:${key}},\n`;
            }
        }
        else {
            bodyProps = `/* TODO: add body properties */`;
        }
        snippetCode = `
try {
  const requestBody = {
    ${bodyProps}
  };

  const response = await this.${method}('${apiPath}', requestBody, {
    headers: {
      'Content-Type': '${contentType}'
    }
  });

  if (response.status === 200 || response.status === 201) {
    return response.data;
  } else {
    console.error('Error:', response);
    return null;
  }
} catch (error) {
  console.error('Exception:', error);
  return null;
}`;
    }
    else {
        // GET/DELETE 無 body
        snippetCode = `
try {
  const response = await this.${method}('${apiPath}', {
    headers: {
      'Content-Type': '${contentType}'
    }
  });

  if (response.status === 200) {
    return response.data;
  } else {
    console.error('Error:', response);
    return null;
  }
} catch (error) {
  console.error('Exception:', error);
  return null;
}`;
    }
    return new vscode_1.SnippetString(snippetCode.trim());
}
// Function to generate default fetch code for an API
function generateDefaultFetchCode(apiPath, method = 'get') {
    if (method === 'get' || method === 'delete') {
        return `
try {
    const response = await this.${method}('${apiPath}', {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 200) {
        return response.data;
    } else {
        console.error('Error fetching data: ', response);
        return null;
    }
} catch (error) {
    console.error('Error fetching data: ', error);
    return null;
}`;
    }
    else {
        return `
try {
    // Request body
    const requestBody = {
        // TODO: Fill in required properties
    };
    
    const response = await this.${method}('${apiPath}', requestBody, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 200 || response.status === 201) {
        return response.data;
    } else {
        console.error('Error submitting data: ', response);
        return null;
    }
} catch (error) {
    console.error('Error submitting data: ', error);
    return null;
}`;
    }
}
function activate(context) {
    const openWebviewCmd = vscode.commands.registerCommand('jennieapi.openWebview', () => {
        const panel = vscode.window.createWebviewPanel('jennieWebview', 'Jennie WebView', vscode.ViewColumn.One, {
            enableScripts: true
        });
        // 取得 HTML 檔案路徑
        const htmlPath = path.join(context.extensionPath, 'media', 'webview.html');
        // 讀取 HTML 檔案內容
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        // 設定 Webview HTML
        panel.webview.html = htmlContent;
        vscode.window.showInformationMessage('JennieAPI WebView UI 仍然存在喔！');
    });
    const testapiCmd = vscode.commands.registerCommand('jennieapi.testapiCmd', async () => {
        const result = await generateResponse("hi");
        vscode.window.showInformationMessage(result);
    });
    // // Function to generate fetch code via command
    // async function generateFetchCode() {
    //   const apis = await getApiPaths();
    //   if (apis.length === 0) {
    //       return;
    //   }
    //   const selectedApi = await vscode.window.showQuickPick(apis, { placeHolder: 'Select an API' });
    //   if (!selectedApi) {
    //       return;
    //   }
    //   // Get methods available for this API
    //   const apiDocs = await readApiDocs();
    //   const pathInfo = apiDocs?.paths[selectedApi];
    //   if (!pathInfo) {
    //     vscode.window.showErrorMessage("API path info not found");
    //     return;
    //   }
    //   // Find available methods for this endpoint
    //   const methods = ['get', 'post', 'put', 'delete', 'patch']
    //     .filter(method => pathInfo[method as keyof typeof pathInfo]);
    //   // If no methods found, default to GET
    //   if (methods.length === 0) {
    //     methods.push('get');
    //   }
    //   // If only one method, use it directly
    //   let selectedMethod = methods[0];
    //   // If multiple methods, let user choose
    //   if (methods.length > 1) {
    //     selectedMethod = await vscode.window.showQuickPick(methods, { 
    //       placeHolder: 'Select HTTP method'
    //     }) || methods[0];
    //   }
    //   const fetchCode = await generateFetchCodeForApi(selectedApi, selectedMethod);
    //   const editor = vscode.window.activeTextEditor;
    //   if (editor) {
    //     const fetchSnippet = await generateFetchCodeForApi(selectedApi, selectedMethod);
    //     // 👇 插入前顯示提示
    //     vscode.window.showInformationMessage('⚙️ Generating API function...');
    //     await editor.insertSnippet(fetchSnippet, editor.selection.active);
    //     const fullText = editor.document.getText();
    //     const insertedCode = fetchSnippet.value;
    //     const prompt = `Based on the following original code written by the user, please determine whether the language is JavaScript or TypeScript:
    //     \`\`\`
    //     ${fullText}
    //     \`\`\`
    //     The following API fetch code was just inserted into it:
    //     \`\`\`
    //     ${insertedCode}
    //     \`\`\`
    //     Please intelligently integrate the inserted code into the original code. If there are any missing parameters or properties (such as in the request body), make reasonable assumptions to fill them in. Ensure that the final code is complete, properly formatted, and executable.
    //     ⚠️ Important: Your response must contain only the final code, without any explanations, comments, or code block markers like \`\`\`.`;
    //     // 👇 重新格式化提示
    //     vscode.window.showInformationMessage('🧠 Refining API function...');
    //     const newCode = await generateResponse(prompt);
    //     if (newCode) {
    //       const entireRange = new vscode.Range(
    //         editor.document.positionAt(0),
    //         editor.document.positionAt(fullText.length)
    //       );
    //       await editor.edit(editBuilder => {
    //         editBuilder.replace(entireRange, newCode);
    //       });
    //       // 👇 成功完成提示
    //       vscode.window.showInformationMessage('✅ Successfully added and refined the API function!');
    //     } else {
    //       vscode.window.showErrorMessage("❌ LLM failed to generate refined code.");
    //     }
    //   } else {
    //     vscode.window.showErrorMessage("No active text editor found.");
    //   }
    // }
    // // Register the context menu command for right-click
    // const showApiListCmd = vscode.commands.registerCommand('jennieapi.showApiList', async (uri: vscode.Uri) => {
    //   await generateFetchCode();  // Call the same function to generate the fetch code when right-clicked
    // });
    // Set up auto-suggestion for API fetch code with improved detection
    const autoSuggestDisposable = vscode.languages.registerCodeActionsProvider(['javascript', 'typescript', 'javascriptreact', 'typescriptreact'], {
        async provideCodeActions(document, range, context, token) {
            const line = document.lineAt(range.start.line);
            const lineText = line.text;
            // Get a window of code for better context
            const startLine = Math.max(0, range.start.line - 2);
            const endLine = Math.min(document.lineCount - 1, range.start.line + 2);
            let contextCode = '';
            for (let i = startLine; i <= endLine; i++) {
                contextCode += document.lineAt(i).text + '\n';
            }
            // Check if the code indicates intent to use an API
            const isApiIntent = await isApiFetchIntent(contextCode);
            if (isApiIntent) {
                return [
                    {
                        title: '💡 Suggest API endpoints',
                        command: 'jennieapi.suggestApiEndpoints',
                        arguments: [document, range.start.line]
                    }
                ];
            }
            return [];
        }
    });
    // ✅ 抽出：建立 LLM prompt
    function buildRefactorPrompt(fullText, insertedCode) {
        return `Based on the following original code written by the user, please determine whether the language is JavaScript or TypeScript:

    \`\`\`
    ${fullText}
    \`\`\`

    The following API fetch code was just inserted into it:

    \`\`\`
    ${insertedCode}
    \`\`\`

    Please intelligently integrate the inserted code into the original code. If there are any missing parameters or properties (such as in the request body), make reasonable assumptions to fill them in. Ensure that the final code is complete, properly formatted, and executable.

    ⚠️ Important: Your response must contain only the final code, without any explanations, comments, or code block markers like \`\`\`.`;
    }
    // 等待指定毫秒數的 Promise helper
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Command to suggest API endpoints based on the current code context
    const suggestApiEndpointsCmd = vscode.commands.registerCommand('jennieapi.suggestApiEndpoints', async (documentArg, lineArg) => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active text editor found.");
            return;
        }
        // Use provided document or default to active editor's document
        const document = documentArg || editor.document;
        // Use provided line or default to the current cursor position
        const line = typeof lineArg === 'number' ? lineArg : editor.selection.active.line;
        // Get context from document
        const startLine = Math.max(0, line - 5);
        const endLine = Math.min(document.lineCount - 1, line + 5);
        let contextCode = '';
        for (let i = startLine; i <= endLine; i++) {
            contextCode += document.lineAt(i).text + '\n';
        }
        // Find relevant APIs using cosine similarity
        const relevantApis = await findRelevantApis(contextCode, line);
        if (relevantApis.length === 0) {
            vscode.window.showInformationMessage('No relevant API endpoints found');
            return;
        }
        const items = relevantApis.map(api => ({
            label: `${api.method.toUpperCase()} ${api.path}`,
            description: api.description,
            detail: `Relevance: ${Math.round(api.similarity * 100)}%`,
            api: api
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an API endpoint to insert fetch code'
        });
        if (selected) {
            // vscode.window.showInformationMessage('⚙️ Generating API function...');
            // Step 1: Generating API function
            let snippet = new vscode.SnippetString();
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "⚙️ Generating API function...",
                cancellable: false,
            }, async (_progress) => {
                await sleep(3000);
                snippet = await generateFetchCodeForApi(selected.api.path, selected.api.method);
                await editor.insertSnippet(snippet, editor.selection.active);
            });
            // Step 2: Refining with LLM
            const fullText = editor.document.getText();
            const insertedCode = snippet.value;
            const prompt = buildRefactorPrompt(fullText, insertedCode);
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🧠 Refining API function...",
                cancellable: false,
            }, async (_progress) => {
                const newCode = await generateResponse(prompt);
                if (newCode) {
                    const entireRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(fullText.length));
                    await editor.edit(editBuilder => {
                        editBuilder.replace(entireRange, newCode);
                    });
                    // progress.report({ increment: 100 });
                    // ✅ 成功完成提示 (這行是非 blocking 的，會出現在右下角)
                    vscode.window.showInformationMessage("✅ Successfully added and refined the API function!");
                }
                else {
                    vscode.window.showErrorMessage("❌ LLM failed to generate refined code.");
                }
            });
        }
    });
    // Enhanced hover provider to show API documentation when hovering over API paths
    const hoverProvider = vscode.languages.registerHoverProvider(['javascript', 'typescript', 'javascriptreact', 'typescriptreact'], {
        async provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) {
                return;
            }
            const word = document.getText(range);
            // Check if this might be an API path
            const apiDocs = await readApiDocs();
            if (!apiDocs) {
                return;
            }
            // Look for paths that contain this word or paths that match exactly
            const relevantPaths = Object.keys(apiDocs.paths).filter(path => path.includes(word) || path === word);
            if (relevantPaths.length > 0) {
                const markdownContent = [];
                for (const path of relevantPaths) {
                    const pathInfo = apiDocs.paths[path];
                    markdownContent.push(`### API: \`${path}\``);
                    // Add methods information
                    const methods = ['get', 'post', 'put', 'delete', 'patch']
                        .filter(method => pathInfo[method]);
                    for (const method of methods) {
                        const endpoint = pathInfo[method];
                        if (!endpoint) {
                            continue;
                        }
                        markdownContent.push(`\n**${method.toUpperCase()}**`);
                        if (endpoint.summary) {
                            markdownContent.push(`\n${endpoint.summary}`);
                        }
                        if (endpoint.description) {
                            markdownContent.push(`\n${endpoint.description}`);
                        }
                        // Add response codes
                        if (endpoint.responses) {
                            markdownContent.push(`\n**Responses:**`);
                            for (const [code, desc] of Object.entries(endpoint.responses)) {
                                markdownContent.push(`- ${code}: ${desc.description || 'No description'}`);
                            }
                        }
                    }
                }
                return new vscode.Hover(markdownContent.join('\n'));
            }
        }
    });
    // Subscribe to text editor changes to provide real-time API suggestions
    const editorChangeDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) {
            return;
        }
        // Check if we're in a supported file type
        const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
        if (!supportedLanguages.includes(editor.document.languageId)) {
            return;
        }
        // Process changes to detect fetch intent
        for (const change of event.contentChanges) {
            // Check if this is a line being completed
            if (change.text === ';' || change.text === '\n') {
                const lineNumber = editor.document.positionAt(change.rangeOffset).line;
                // Get context from surrounding lines
                const startLine = Math.max(0, lineNumber - 2);
                const endLine = Math.min(editor.document.lineCount - 1, lineNumber + 2);
                let contextCode = '';
                for (let i = startLine; i <= endLine; i++) {
                    contextCode += editor.document.lineAt(i).text + '\n';
                }
                // If line indicates fetch intent, show the light bulb (code action)
                const isApiIntent = await isApiFetchIntent(contextCode);
                if (isApiIntent) {
                    // We don't need to do anything here as the code action provider will be triggered
                    // This just ensures a change that indicates fetch intent is processed
                    // Optionally, we could show a notification that API suggestions are available
                    // vscode.window.showInformationMessage('💡 API suggestions available. Click the lightbulb or press Ctrl+.');
                }
            }
        }
    });
    // Register all commands and listeners
    context.subscriptions.push(openWebviewCmd, testapiCmd, 
    // fetchApiCmd, 
    // showApiListCmd,
    autoSuggestDisposable, suggestApiEndpointsCmd, hoverProvider, editorChangeDisposable);
}
//# sourceMappingURL=extension.js.map