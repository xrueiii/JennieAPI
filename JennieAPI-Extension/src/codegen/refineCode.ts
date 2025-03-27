// src/codegen/refineCode.ts

import { generateResponse } from '../core/azureAI';

/**
 * Generates a refinement prompt and calls LLM to clean up the inserted code
 * @param insertedCode The snippet that was just inserted
 * @param fullContextCode The full source code as context
 */
export async function refineInsertedCode(insertedCode: string, fullContextCode: string): Promise<string> {
  const prompt = `
Based on the code generated: ${insertedCode},

and the code user just wrote: ${fullContextCode}

Please must use **fetch** function to write the api function, when you fetch please add the http://localhost:3001/api/ in the front of the url.

**Don't add any new import, don't use "return" in the code you generate**

Use English only!!!

⚠️ Please help me refine the API function the insertedCode is located, **do not modify the original code the user just wrote**.

Please intelligently integrate the inserted code into the original code. If there are any missing parameters or properties (such as in the request body), make reasonable assumptions to fill them in. Ensure that the final code is complete, properly formatted, and executable.

⚠️ Important: Your response must contain only the final code, without any explanations, comments, or code block markers like \`\`\`.
  `;

  return await generateResponse(prompt);
}
