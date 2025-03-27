// src/codegen/fetchSnippet.ts

import { SnippetString } from 'vscode';
import { readApiDocs } from '../core/apiDocs';
import { ApiEndpoint } from '../types';

/**
 * Generates fetch code snippet based on OpenAPI endpoint details
 */
export async function generateFetchCodeForApi(apiPath: string, method: string = 'get'): Promise<SnippetString> {
  const apiDocs = await readApiDocs();
  if (!apiDocs || !apiDocs.paths[apiPath]) {
    return new SnippetString(generateDefaultFetchCode(apiPath, method).trim());
  }

  const pathInfo = apiDocs.paths[apiPath];
  const endpoint = pathInfo?.[method as keyof typeof pathInfo] as ApiEndpoint | undefined;

  let snippetCode = '';
  let i = 1;

  const contentType = endpoint?.requestBody?.content?.['application/json'] ? 'application/json' : 'application/json';

  if (['post', 'put', 'patch'].includes(method)) {
    const schema = endpoint?.requestBody?.content?.['application/json']?.schema;
    let bodyProps = '';

    if (schema && schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        bodyProps += `${key}: \${${i++}:${key}},\n`;
      }
    } else {
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
}`.trim();
  } else {
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
}`.trim();
  }

  return new SnippetString(snippetCode);
}

/**
 * Fallback default fetch code if no schema is available
 */
export function generateDefaultFetchCode(apiPath: string, method: string = 'get'): string {
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
}`.trim();
  } else {
    return `
try {
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
}`.trim();
  }
}
