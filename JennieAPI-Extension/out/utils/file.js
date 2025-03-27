"use strict";
// src/utils/file.ts
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
exports.getAllSourceFiles = getAllSourceFiles;
exports.normalizePath = normalizePath;
exports.buildOpenApiPrompt = buildOpenApiPrompt;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Recursively retrieves all .java and .ts source files from a directory
 */
function getAllSourceFiles(dir) {
    let results = [];
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllSourceFiles(filePath));
        }
        else if (filePath.endsWith('.java') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}
/**
 * Normalize two path parts into a single valid URL path
 */
function normalizePath(base, sub) {
    const baseFixed = base.endsWith('/') ? base.slice(0, -1) : base;
    const subFixed = sub.startsWith('/') ? sub : '/' + sub;
    return baseFixed + subFixed;
}
/**
 * Build OpenAPI prompt based on file content
 */
function buildOpenApiPrompt(fileName, fileContent) {
    return `
You are an API documentation generator.

Please analyze the following backend controller code (${fileName}) and convert its content into a valid OpenAPI 3.0 format (only the 'paths' section is required):

\
\
\
${fileContent}
\
\
\

🧠 Important:
- Use English only!
- Return a pure JSON object with only the "paths" content.
- Use correct HTTP methods (get/post/put/delete/patch).
- Include parameters (query, path) if applicable.
- If requestBody is used, include an example JSON schema.
- Make sure the structure matches OpenAPI 3.0 spec exactly.

⚠️ Strict rules:
- Do not include any explanations, comments, or markdown syntax.
- Do not wrap the response in triple backticks or any other formatting.
- Respond only with valid JSON. No leading or trailing text allowed.

Output example:
{
  "/your/path": {
    "get": {
      "summary": "Get something",
      "description": "Returns something useful",
      "parameters": [
        {
          "name": "id",
          "in": "query",
          "required": false,
          "schema": { "type": "string" }
        }
      ],
      "responses": {
        "200": {
          "description": "Success"
        }
      }
    }
  }
}
  `;
}
//# sourceMappingURL=file.js.map