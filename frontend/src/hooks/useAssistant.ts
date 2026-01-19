import { useState } from 'react';
import { PromptResponse } from '../services/api';

interface UseAssistantReturn {
  answer: string | null;
  loading: boolean;
  error: string | null;
  latency: number | null;
  ask: (query: string) => Promise<void>;
}

export const useAssistant = (): UseAssistantReturn => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const ask = async (query: string) => {
    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const { api } = await import('../services/api');
      const response: PromptResponse = await api.ask(query);
      setAnswer(response.answer);
      setLatency(response.latency_seconds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error querying assistant:', err);
    } finally {
      setLoading(false);
    }
  };

  return { answer, loading, error, latency, ask };
};
