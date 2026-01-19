import axios, { AxiosInstance } from 'axios';

export interface PromptRequest {
  query: string;
}

export interface PromptResponse {
  answer: string;
  mode: string;
  latency_seconds: number;
}

export interface HealthResponse {
  status: string;
  mode: string;
}

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 60000, // 60 second timeout for LLM calls
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a query to the AI assistant
   * @param query - The user's query/prompt
   * @returns Promise containing the AI's answer and metadata
   */
  async ask(query: string): Promise<PromptResponse> {
    const request: PromptRequest = { query };
    const response = await this.client.post<PromptResponse>('/prompt', request);
    return response.data;
  }

  /**
   * Check if the backend is healthy and running
   * @returns Promise containing health status and current mode
   */
  async health(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/health');
    return response.data;
  }

  /**
   * Set the base URL for the API client (useful for changing backends)
   * @param baseURL - New base URL
   */
  setBaseURL(baseURL: string): void {
    this.client = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Export singleton instance
export const api = new APIClient();
export default APIClient;
