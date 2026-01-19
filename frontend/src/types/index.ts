import { PromptResponse } from '../services/api';

export interface AssistantQuery {
  id: string;
  query: string;
  response: PromptResponse | null;
  timestamp: Date;
  error?: string;
}
