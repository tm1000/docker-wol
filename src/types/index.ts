// Wake Request - Input entity
export interface WakeRequest {
  mac: string;
  address?: string;
  port?: number;
  interface?: string;
}

// Wake Response - Success response
export interface WakeResponse {
  status: 'success';
  message: string;
  mac: string;
  timestamp: string;
}

// Error Detail - Error information
export interface ErrorDetail {
  code: string;
  details?: string;
}

// Error Response - Error response
export interface ErrorResponse {
  status: 'error';
  message: string;
  mac: string;
  timestamp: string;
  error?: ErrorDetail;
}

// Health Response - Health check response
export interface HealthResponse {
  status: 'healthy';
  uptime: number;
  timestamp: string;
}

// Application Configuration
export interface AppConfig {
  apiKey: string;
  port: number;
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  nodeEnv: string;
}
