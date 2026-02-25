import axios, { AxiosRequestConfig } from 'axios';

export interface PromptRequest {
  query: string;
}

export interface Response {
  answer: string;
  mode: string;
  latency_seconds: number;
}

// Prompt Management Interfaces
export interface IPrompt {
  id: number;
  title: string;
  content: string;
  type: string;
  tags: string;
  version: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface IPromptCreate {
  title: string;
  content: string;
  type: string;
  tags?: string;
  is_active?: boolean;
}

export interface IPromptUpdate {
  title?: string;
  content?: string;
  type?: string;
  tags?: string;
  is_active?: boolean;
}

export interface IPromptList {
  total: number;
  prompts: IPrompt[];
  page: number;
  page_size: number;
}

export interface IPromptActivateResponse {
  id: number;
  title: string;
  type: string;
  is_active: boolean;
  message: string;
}

const headers:HeadersInit = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // Allow all origins for CORS
  
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

// Prompt Management API Functions
const getPrompts = async (promptType?: string, tags?: string, page: number = 1, pageSize: number = 10): Promise<IPromptList> => {
  const params = new URLSearchParams();
  if (promptType) params.append('prompt_type', promptType);
  if (tags) params.append('tags', tags);
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  
  const response = await client.get<IPromptList>(`/prompts?${params.toString()}`);
  if (response.statusText !== 'OK') {
    throw new Error('Failed to fetch prompts');
  }
  return response.data;
};

const getPrompt = async (id: number): Promise<IPrompt> => {
  const response = await client.get<IPrompt>(`/prompts/${id}`);
  if (response.statusText !== 'OK') {
    throw new Error('Failed to fetch prompt');
  }
  return response.data;
};

const savePrompt = async (data: IPromptCreate): Promise<IPrompt> => {
  const response = await client.post<IPrompt>('/prompts', data);
  if (response.statusText !== 'OK') {
    throw new Error('Failed to save prompt');
  }
  return response.data;
};

const updatePrompt = async (id: number, data: IPromptUpdate): Promise<IPrompt> => {
  const response = await client.put<IPrompt>(`/prompts/${id}`, data);
  if (response.statusText !== 'OK') {
    throw new Error('Failed to update prompt');
  }
  return response.data;
};

const deletePrompt = async (id: number): Promise<{ message: string }> => {
  const response = await client.delete<{ message: string }>(`/prompts/${id}`);
  if (response.statusText !== 'OK') {
    throw new Error('Failed to delete prompt');
  }
  return response.data;
};

const activatePrompt = async (id: number): Promise<IPromptActivateResponse> => {
  const response = await client.patch<IPromptActivateResponse>(`/prompts/${id}/activate`);
  if (response.statusText !== 'OK') {
    throw new Error('Failed to activate prompt');
  }
  return response.data;
};

export { 
  usePromptQuestionAPI, 
  useGetHealthAPI,
  getPrompts,
  getPrompt,
  savePrompt,
  updatePrompt,
  deletePrompt,
  activatePrompt,
};
