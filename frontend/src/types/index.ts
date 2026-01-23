import { Response } from '../services/api';

export interface AssistantQuery {
  id: string;
  query: string;
  response?: Response;
  timestamp: Date;
  error?: Error | string;
}
