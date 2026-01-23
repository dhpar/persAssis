import axios, { AxiosRequestConfig } from 'axios';

export interface PromptRequest {
  query: string;
}

export interface Response {
  answer: string;
  mode: string;
  latency_seconds: number;
}


const headers:HeadersInit = {
  'Content-Type': 'application/json',
}

const request: AxiosRequestConfig  = {
  baseURL: 'http://localhost:8000',
  timeout: 60000, // 60 second timeout for LLM calls
  headers
}

const client = axios.create(request);

const usePromptQuestionAPI = async ({query}: {query: string}) => {
  const request: PromptRequest = { query };
  const response = await client.post<Response>('/prompt', request);
  // const answer = response.data.answer;
  console.log('Prompt API response:', response.data.answer);
  if(response.statusText !== 'OK') {
      throw new Error('Prompt API request failed');
  }

  return response;
} 

const useGetHealthAPI = async() => {
    const response = await client.get<Response>('/health');
    
    if(response.statusText !== 'OK') {
      throw new Error('Backend health check failed');
    }

    return response;
}

export { usePromptQuestionAPI, useGetHealthAPI };
