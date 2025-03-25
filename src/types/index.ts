/**
 * OpenAI message format
 */
export type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
  };
  
  /**
   * Supported HTTP methods
   */
  export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
  
  /**
   * API parameter object used in OpenAPI format
   */
  export interface ApiParameter {
    name: string;
    in: 'query' | 'path' | 'header' | 'cookie';
    required: boolean;
    schema: {
      type: string;
    };
  }
  
  /**
   * API response object
   */
  export interface ApiResponse {
    [status: string]: {
      description: string;
    };
  }
  
  /**
   * API request body content schema
   */
  export interface ApiRequestBody {
    content: {
      [contentType: string]: {
        schema?: {
          type?: string;
          properties?: Record<string, any>;
        };
      };
    };
  }
  
  /**
   * API method definition (GET, POST, etc.)
   */
  export interface ApiEndpoint {
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: ApiParameter[];
    requestBody?: ApiRequestBody;
    responses?: ApiResponse;
  }
  
  /**
   * Main API documentation structure (OpenAPI format)
   */
  export interface ApiDoc {
    openapi?: string;
    info?: {
      title?: string;
      description?: string;
      version?: string;
    };
    servers?: Array<{
      url: string;
    }>;
    paths: {
      [path: string]: {
        get?: ApiEndpoint;
        post?: ApiEndpoint;
        put?: ApiEndpoint;
        delete?: ApiEndpoint;
        patch?: ApiEndpoint;
        description?: string;
      };
    };
  }
  