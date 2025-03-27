// src/utils/file.ts

import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively retrieves all .java and .ts source files from a directory
 */
export function getAllSourceFiles(dir: string): string[] {
  let results: string[] = [];

  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSourceFiles(filePath));
    } else if (filePath.endsWith('.java') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });

  return results;
}

/**
 * Normalize two path parts into a single valid URL path
 */
export function normalizePath(base: string, sub: string): string {
  const baseFixed = base.endsWith('/') ? base.slice(0, -1) : base;
  const subFixed = sub.startsWith('/') ? sub : '/' + sub;
  return baseFixed + subFixed;
}

/**
 * Build OpenAPI prompt based on file content
 */
export function buildOpenApiPrompt(fileName: string, fileContent: string): string {
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