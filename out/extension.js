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
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
// ✅ Load .env variables
dotenv.config();
const url = "https://ai-wayneyang70211738ai298523890930.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview";
const apiKey = "FqKvwsq0fsCLYAUG1HPCuxqa2sWoKgUpeBfYvQ2XGAsDJez6ME0uJQQJ99BCACHYHv6XJ3w3AAAAACOGTCQx";
// ✅ Dynamic import of node-fetch for CommonJS compatibility
const fetch = async (url, init) => {
    const mod = await import("node-fetch");
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
        "api-key": apiKey,
    };
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
    ];
    const requestBody = {
        messages,
        max_tokens: 100,
        temperature: 1,
        top_p: 1,
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
        });
        const data = (await response.json());
        if (!response.ok) {
            vscode.window.showErrorMessage(`⚠️ Azure API Error: ${data.error?.message || "Unknown error"}`);
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
    const possibleFiles = [
        "api.json",
        "openapi.json",
        "swagger.json",
        "api-docs.json",
    ];
    let apiDocPath = "";
    for (const filename of possibleFiles) {
        const testPath = path.join(workspaceFolders[0].uri.fsPath, filename);
        if (fs.existsSync(testPath)) {
            apiDocPath = testPath;
            break;
        }
    }
    if (!apiDocPath) {
        vscode.window.showErrorMessage("API documentation file not found. Looked for: " +
            possibleFiles.join(", "));
        return null;
    }
    try {
        const fileContent = fs.readFileSync(apiDocPath, "utf-8");
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
    const cleanLine = text.replace(/[(){};=]/g, " ");
    // Split into words
    const words = cleanLine
        .split(/\s+/)
        .filter((word) => word.length > 2) // Filter out very short words
        .filter((word) => !/^[0-9]+$/.test(word)) // Filter out numbers
        .map((word) => word.toLowerCase())
        .filter((word) => !isStopWord(word));
    // Extract potential entities and noun phrases
    const entities = extractEntities(text);
    return [...new Set([...words, ...entities])];
}
// Simple stop words filter
function isStopWord(word) {
    const stopWords = new Set([
        "const",
        "let",
        "var",
        "function",
        "async",
        "await",
        "return",
        "import",
        "export",
        "from",
        "require",
        "module",
        "this",
        "class",
        "interface",
        "type",
        "enum",
        "true",
        "false",
        "null",
        "undefined",
        "new",
        "try",
        "catch",
        "if",
        "else",
        "for",
        "while",
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
    const snakeCaseWords = text.split("_").filter((word) => word.length > 2);
    entities.push(...snakeCaseWords.map((word) => word.toLowerCase()));
    // Extract words from kebab-case
    const kebabCaseWords = text.split("-").filter((word) => word.length > 2);
    entities.push(...kebabCaseWords.map((word) => word.toLowerCase()));
    return [...new Set(entities)];
}
// Enhanced function to calculate similarity between text and API using cosine similarity
function calculateCosineSimilarity(keywords, apiText) {
    // Tokenize API text
    const apiTokens = apiText
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 2 && !isStopWord(word));
    // Create term frequency maps
    const keywordsMap = new Map();
    const apiMap = new Map();
    // Fill keyword frequency map
    keywords.forEach((keyword) => {
        keywordsMap.set(keyword, (keywordsMap.get(keyword) || 0) + 1);
    });
    // Fill API text frequency map
    apiTokens.forEach((token) => {
        apiMap.set(token, (apiMap.get(token) || 0) + 1);
    });
    // Get all unique terms
    const allTerms = new Set([...keywordsMap.keys(), ...apiMap.keys()]);
    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let keywordsMagnitude = 0;
    let apiMagnitude = 0;
    allTerms.forEach((term) => {
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
    let contextCode = "";
    for (let i = startLine; i <= endLine; i++) {
        contextCode += document.lineAt(i).text + " ";
    }
    // Extract keywords from both current line and context
    const currentLineText = document.lineAt(lineNumber).text;
    const currentLineKeywords = extractKeywords(currentLineText);
    const contextKeywords = extractKeywords(contextCode);
    // Combine with higher weight for current line keywords
    const combinedKeywords = [
        ...currentLineKeywords,
        ...currentLineKeywords,
        ...contextKeywords,
    ];
    // Match keywords against API paths and descriptions
    const matches = [];
    for (const [path, pathInfo] of Object.entries(apiDocs.paths)) {
        const methods = ["get", "post", "put", "delete", "patch"];
        for (const method of methods) {
            const endpoint = pathInfo[method];
            if (!endpoint) {
                continue;
            }
            // Build a rich text representation of this API endpoint
            const apiText = [
                path,
                method,
                endpoint.summary || "",
                endpoint.description || "",
                endpoint.operationId || "",
                // Include any parameter names
                ...(endpoint.parameters || []).map((p) => p.name || ""),
                // Include any request body properties if available
                ...(endpoint.requestBody?.content
                    ? Object.keys(endpoint.requestBody.content).map((contentType) => contentType)
                    : []),
            ].join(" ");
            // Calculate similarity between keywords and API text
            const similarity = calculateCosineSimilarity(combinedKeywords, apiText);
            if (similarity > 0.1) {
                // threshold to consider it a match
                matches.push({
                    path,
                    method,
                    description: endpoint.summary || path,
                    similarity,
                });
            }
        }
    }
    // Sort by similarity score and return top matches
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
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
        /\/\/ send/i,
    ];
    // Check for common patterns first
    if (fetchPatterns.some((pattern) => pattern.test(code))) {
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
async function generateFetchCodeForApi(apiPath, method = "get") {
    const apiDocs = await readApiDocs();
    if (!apiDocs || !apiDocs.paths[apiPath]) {
        return generateDefaultFetchCode(apiPath, method);
    }
    const pathInfo = apiDocs.paths[apiPath];
    const endpoint = pathInfo[method];
    // Determine content type and build request body if needed
    let contentType = "application/json";
    let requestBodyCode = "";
    if (endpoint?.requestBody?.content) {
        const contentTypes = Object.keys(endpoint.requestBody.content);
        if (contentTypes.includes("multipart/form-data")) {
            contentType = "multipart/form-data";
            // Generate form data code for multipart requests
            requestBodyCode = `
    // Create form data for multipart request
    const formData = new FormData();
    
    // TODO: Add your form fields here
    // Example: formData.append('fieldName', fieldValue);
    
    // For file uploads
    // formData.append('file', fileInput.files[0]);`;
        }
        else if (contentTypes.includes("application/json")) {
            contentType = "application/json";
            // Get JSON schema if available and generate stub
            let jsonSchema = endpoint.requestBody.content["application/json"].schema;
            if (jsonSchema) {
                requestBodyCode = `
    // Request body
    const requestBody = {
      // TODO: Fill in required properties
      /* ${JSON.stringify(jsonSchema, null, 2)} */
    };`;
            }
            else {
                requestBodyCode = `
    // Request body
    const requestBody = {
      // TODO: Fill in required properties
    };`;
            }
        }
    }
    // Generate appropriate code based on method and content type
    if (method === "get" || method === "delete") {
        return `
try {
    const response = await this.${method}('${apiPath}', {
        headers: {
            'Content-Type': '${contentType}'
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
        // For POST, PUT, PATCH
        if (contentType === "multipart/form-data") {
            return `
try {${requestBodyCode}
    
    const response = await this.${method}('${apiPath}', formData, {
        headers: {
            'Content-Type': '${contentType}'
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
        else {
            return `
try {${requestBodyCode}
    
    const response = await this.${method}('${apiPath}', requestBody, {
        headers: {
            'Content-Type': '${contentType}'
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
}
// Function to generate default fetch code for an API
function generateDefaultFetchCode(apiPath, method = "get") {
    if (method === "get" || method === "delete") {
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
function normalizePath(base, sub) {
    const baseFixed = base.endsWith("/") ? base.slice(0, -1) : base;
    const subFixed = sub.startsWith("/") ? sub : "/" + sub;
    return baseFixed + subFixed;
}
function ensurePathMethod(doc, path, method) {
    if (!doc.paths[path]) {
        doc.paths[path] = {};
    }
    if (!doc.paths[path][method]) {
        const opId = `${method}_${path.replace(/[\/{}]/g, "_").replace(/^_/, "")}`;
        doc.paths[path][method] = {
            summary: `${method.toUpperCase()} ${path}`,
            description: `Handles HTTP ${method.toUpperCase()} request for ${path}`,
            operationId: opId,
            parameters: [],
            responses: {
                "200": {
                    description: "OK",
                },
            },
        };
    }
    return doc.paths[path][method];
}
function toSentenceCase(camelCase) {
    // e.g. "getAllContests" → "Get all contests"
    const result = camelCase.replace(/([A-Z])/g, " $1").toLowerCase();
    return result.charAt(0).toUpperCase() + result.slice(1);
}
function parseTypeScriptControllerToApiDoc(text) {
    const lines = text.split("\n");
    const apiDoc = {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            description: "Generated from TypeScript Controller",
            version: "1.0.0",
        },
        servers: [{ url: "http://localhost:3000" }],
        paths: {},
    };
    const decoratorRegex = /@(Get|Post|Put|Delete|Patch)\(["'`]?(\/[^"'`]*)["'`]?\)/;
    const methodRegex = /(async\s+)?(\w+)\s*\(.*\)\s*{/;
    let currentPath = "";
    let currentMethod = "get";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const decoratorMatch = line.match(decoratorRegex);
        if (decoratorMatch) {
            currentMethod = decoratorMatch[1].toLowerCase();
            currentPath = decoratorMatch[2];
        }
        const methodMatch = line.match(methodRegex);
        if (methodMatch && currentPath) {
            const methodName = methodMatch[2];
            const endpoint = ensurePathMethod(apiDoc, currentPath, currentMethod);
            endpoint.summary = toSentenceCase(methodName);
            endpoint.description = `Handles ${currentMethod.toUpperCase()} for ${currentPath}`;
            currentPath = ""; // reset after use
        }
    }
    return apiDoc;
}
function parseJavaControllerToApiDoc(text) {
    const lines = text.split("\n");
    const apiDoc = {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            description: "Generated from Java Controller",
            version: "1.0.0",
        },
        servers: [{ url: "http://localhost:8080" }],
        paths: {},
    };
    const requestMappingRegex = /@RequestMapping\("([^"]+)"\)/;
    const methodRegex = /@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)(\(([^)]*)\))?/;
    const methodNameRegex = /(public|private|protected)\s+\w+\s+(\w+)\s*\(/;
    const pathParamRegex = /@PathVariable\s+(\w+\s)?(\w+)/g;
    const reqParamRegex = /@RequestParam\("([^"]+)"\)/g;
    const requestBodyRegex = /@RequestBody\s+(\w+\s)?(\w+)/;
    let basePath = "";
    let pendingComment = ""; // Store last Javadoc comment block
    for (const line of lines) {
        const match = line.match(requestMappingRegex);
        if (match) {
            basePath = match[1];
            break;
        }
    }
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Capture Javadoc comment
        if (line.startsWith("/**")) {
            pendingComment = line.replace("/**", "").trim();
            for (let j = i + 1; j < lines.length; j++) {
                const commentLine = lines[j].trim();
                if (commentLine.startsWith("*/")) {
                    break;
                }
                pendingComment += " " + commentLine.replace("*", "").trim();
                i = j;
            }
        }
        const methodMatch = line.match(methodRegex);
        if (methodMatch) {
            const currentMethod = methodMatch[1].toLowerCase();
            const pathMatch = methodMatch[3]?.match(/"([^"]+)"/);
            const currentPath = pathMatch ? pathMatch[1] : "";
            const fullPath = normalizePath(basePath, currentPath);
            // Extract method name
            let methodName = "unnamedMethod";
            for (let k = i; k < i + 5; k++) {
                const methodNameMatch = lines[k]?.match(methodNameRegex);
                if (methodNameMatch) {
                    methodName = methodNameMatch[2];
                    break;
                }
            }
            const endpoint = ensurePathMethod(apiDoc, fullPath, currentMethod);
            endpoint.summary = toSentenceCase(methodName);
            endpoint.description =
                pendingComment ||
                    `Handles ${currentMethod.toUpperCase()} for ${fullPath}`;
            pendingComment = ""; // reset comment after use
            const seenParams = new Set();
            for (let j = i; j < Math.min(i + 10, lines.length); j++) {
                const methodLine = lines[j];
                let match;
                while ((match = pathParamRegex.exec(methodLine)) !== null) {
                    const paramName = match[2];
                    if (!seenParams.has(paramName)) {
                        endpoint.parameters.push({
                            name: paramName,
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        });
                        seenParams.add(paramName);
                    }
                }
                while ((match = reqParamRegex.exec(methodLine)) !== null) {
                    const paramName = match[1];
                    if (!seenParams.has(paramName)) {
                        endpoint.parameters.push({
                            name: paramName,
                            in: "query",
                            required: false,
                            schema: { type: "string" },
                        });
                        seenParams.add(paramName);
                    }
                }
                const bodyMatch = methodLine.match(requestBodyRegex);
                if (bodyMatch) {
                    endpoint.requestBody = {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    description: `Payload for ${methodName}`,
                                },
                            },
                        },
                    };
                }
            }
        }
    }
    return apiDoc;
}
function getAllSourceFiles(dir) {
    let results = [];
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllSourceFiles(filePath));
        }
        else if (filePath.endsWith(".java") || filePath.endsWith(".ts")) {
            results.push(filePath);
        }
    });
    return results;
}
function activate(context) {
    const generateApiJsonFromFolder = vscode.commands.registerCommand("jennieapi.generateApiJson", async (uri) => {
        const folderPath = uri?.fsPath;
        vscode.window.showInformationMessage(`✅ Command triggered for: ${uri?.fsPath}`);
        if (!folderPath) {
            vscode.window.showErrorMessage("❌ 請從 Explorer 選擇一個資料夾來產生 API 文件。");
            return;
        }
        vscode.window.showInformationMessage(`📁 開始掃描資料夾：${folderPath}`);
        const sourceFiles = getAllSourceFiles(folderPath);
        const apiDoc = {
            openapi: "3.0.0",
            info: {
                title: "API Documentation",
                description: "Auto-generated from Spring Boot controllers",
                version: "1.0.0",
            },
            servers: [{ url: "http://localhost:8080" }],
            paths: {},
        };
        for (const filePath of sourceFiles) {
            const content = fs.readFileSync(filePath, "utf-8");
            if (filePath.endsWith(".java") && content.includes("@RestController")) {
                const doc = parseJavaControllerToApiDoc(content);
                Object.assign(apiDoc.paths, doc.paths);
            }
            else if (filePath.endsWith(".ts") &&
                content.match(/@(Get|Post|Put|Delete|Patch)/)) {
                const doc = parseTypeScriptControllerToApiDoc(content);
                Object.assign(apiDoc.paths, doc.paths);
            }
        }
        const outputPath = path.join(folderPath, "api.json");
        fs.writeFileSync(outputPath, JSON.stringify(apiDoc, null, 2), "utf-8");
        vscode.window.showInformationMessage(`✅ API 文件已儲存到：${outputPath}`);
        const document = await vscode.workspace.openTextDocument(outputPath);
        vscode.window.showTextDocument(document);
    });
    const openWebviewCmd = vscode.commands.registerCommand("jennieapi.openWebview", () => {
        const panel = vscode.window.createWebviewPanel("jennieWebview", "Jennie WebView", vscode.ViewColumn.One, {
            enableScripts: true,
        });
        // 取得 HTML 檔案路徑
        const htmlPath = path.join(context.extensionPath, "media", "webview.html");
        // 讀取 HTML 檔案內容
        const htmlContent = fs.readFileSync(htmlPath, "utf8");
        // 設定 Webview HTML
        panel.webview.html = htmlContent;
        vscode.window.showInformationMessage("JennieAPI WebView UI 仍然存在喔！");
    });
    const testapiCmd = vscode.commands.registerCommand("jennieapi.testapiCmd", async () => {
        const result = await generateResponse("hi");
        vscode.window.showInformationMessage(result);
    });
    // Function to generate fetch code via command
    async function generateFetchCode() {
        const apis = await getApiPaths();
        if (apis.length === 0) {
            return;
        }
        const selectedApi = await vscode.window.showQuickPick(apis, {
            placeHolder: "Select an API",
        });
        if (!selectedApi) {
            return;
        }
        // Get methods available for this API
        const apiDocs = await readApiDocs();
        const pathInfo = apiDocs?.paths[selectedApi];
        if (!pathInfo) {
            vscode.window.showErrorMessage("API path info not found");
            return;
        }
        // Find available methods for this endpoint
        const methods = ["get", "post", "put", "delete", "patch"].filter((method) => pathInfo[method]);
        // If no methods found, default to GET
        if (methods.length === 0) {
            methods.push("get");
        }
        // If only one method, use it directly
        let selectedMethod = methods[0];
        // If multiple methods, let user choose
        if (methods.length > 1) {
            selectedMethod =
                (await vscode.window.showQuickPick(methods, {
                    placeHolder: "Select HTTP method",
                })) || methods[0];
        }
        const fetchCode = await generateFetchCodeForApi(selectedApi, selectedMethod);
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit((editBuilder) => {
                editBuilder.insert(editor.selection.active, fetchCode);
            });
        }
        else {
            vscode.window.showErrorMessage("No active text editor found.");
        }
    }
    const fetchApiCmd = vscode.commands.registerCommand("jennieapi.fetchApiList", async () => {
        await generateFetchCode(); // Call the function to generate the fetch code
    });
    // Register the context menu command for right-click
    const showApiListCmd = vscode.commands.registerCommand("jennieapi.showApiList", async (uri) => {
        await generateFetchCode(); // Call the same function to generate the fetch code when right-clicked
    });
    // Set up auto-suggestion for API fetch code with improved detection
    const autoSuggestDisposable = vscode.languages.registerCodeActionsProvider(["javascript", "typescript", "javascriptreact", "typescriptreact"], {
        async provideCodeActions(document, range, context, token) {
            const line = document.lineAt(range.start.line);
            const lineText = line.text;
            // Get a window of code for better context
            const startLine = Math.max(0, range.start.line - 2);
            const endLine = Math.min(document.lineCount - 1, range.start.line + 2);
            let contextCode = "";
            for (let i = startLine; i <= endLine; i++) {
                contextCode += document.lineAt(i).text + "\n";
            }
            // Check if the code indicates intent to use an API
            const isApiIntent = await isApiFetchIntent(contextCode);
            if (isApiIntent) {
                return [
                    {
                        title: "💡 Suggest API endpoints",
                        command: "jennieapi.suggestApiEndpoints",
                        arguments: [document, range.start.line],
                    },
                ];
            }
            return [];
        },
    });
    // Command to suggest API endpoints based on the current code context
    const suggestApiEndpointsCmd = vscode.commands.registerCommand("jennieapi.suggestApiEndpoints", async (documentArg, lineArg) => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active text editor found.");
            return;
        }
        // Use provided document or default to active editor's document
        const document = documentArg || editor.document;
        // Use provided line or default to the current cursor position
        const line = typeof lineArg === "number" ? lineArg : editor.selection.active.line;
        // Get context from document
        const startLine = Math.max(0, line - 5);
        const endLine = Math.min(document.lineCount - 1, line + 5);
        let contextCode = "";
        for (let i = startLine; i <= endLine; i++) {
            contextCode += document.lineAt(i).text + "\n";
        }
        // Find relevant APIs using cosine similarity
        const relevantApis = await findRelevantApis(contextCode, line);
        if (relevantApis.length === 0) {
            vscode.window.showInformationMessage("No relevant API endpoints found");
            return;
        }
        const items = relevantApis.map((api) => ({
            label: `${api.method.toUpperCase()} ${api.path}`,
            description: api.description,
            detail: `Relevance: ${Math.round(api.similarity * 100)}%`,
            api: api,
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: "Select an API endpoint to insert fetch code",
        });
        if (selected) {
            const fetchCode = await generateFetchCodeForApi(selected.api.path, selected.api.method);
            editor.edit((editBuilder) => {
                // Insert at the cursor position
                editBuilder.insert(editor.selection.active, fetchCode);
            });
        }
    });
    // Enhanced hover provider to show API documentation when hovering over API paths
    const hoverProvider = vscode.languages.registerHoverProvider(["javascript", "typescript", "javascriptreact", "typescriptreact"], {
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
            const relevantPaths = Object.keys(apiDocs.paths).filter((path) => path.includes(word) || path === word);
            if (relevantPaths.length > 0) {
                const markdownContent = [];
                for (const path of relevantPaths) {
                    const pathInfo = apiDocs.paths[path];
                    markdownContent.push(`### API: \`${path}\``);
                    // Add methods information
                    const methods = ["get", "post", "put", "delete", "patch"].filter((method) => pathInfo[method]);
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
                                markdownContent.push(`- ${code}: ${desc.description || "No description"}`);
                            }
                        }
                    }
                }
                return new vscode.Hover(markdownContent.join("\n"));
            }
        },
    });
    // Subscribe to text editor changes to provide real-time API suggestions
    const editorChangeDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) {
            return;
        }
        // Check if we're in a supported file type
        const supportedLanguages = [
            "javascript",
            "typescript",
            "javascriptreact",
            "typescriptreact",
        ];
        if (!supportedLanguages.includes(editor.document.languageId)) {
            return;
        }
        // Process changes to detect fetch intent
        for (const change of event.contentChanges) {
            // Check if this is a line being completed
            if (change.text === ";" || change.text === "\n") {
                const lineNumber = editor.document.positionAt(change.rangeOffset).line;
                // Get context from surrounding lines
                const startLine = Math.max(0, lineNumber - 2);
                const endLine = Math.min(editor.document.lineCount - 1, lineNumber + 2);
                let contextCode = "";
                for (let i = startLine; i <= endLine; i++) {
                    contextCode += editor.document.lineAt(i).text + "\n";
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
    context.subscriptions.push(openWebviewCmd, testapiCmd, fetchApiCmd, showApiListCmd, autoSuggestDisposable, suggestApiEndpointsCmd, hoverProvider, editorChangeDisposable, generateApiJsonFromFolder);
}
//# sourceMappingURL=extension.js.map