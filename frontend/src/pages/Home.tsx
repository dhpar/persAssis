import React, { useState, useEffect } from 'react';
import { QueryInput } from '../components/QueryInput';
import { QueryResult } from '../components/QueryResult';
import { useAssistant } from '../hooks/useAssistant';
import { AssistantQuery } from '../types';
import { api } from '../services/api';

export const Home: React.FC = () => {
  const { answer, loading, error, latency, ask } = useAssistant();
  const [queries, setQueries] = useState<AssistantQuery[]>([]);
  const [backendStatus, setBackendStatus] = useState<string>('checking...');

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await api.health();
        setBackendStatus(`${health.status} (${health.mode})`);
      } catch (err) {
        setBackendStatus('offline');
      }
    };
    checkHealth();
  }, []);

  const handleSubmit = async (query: string) => {
    const queryId = Date.now().toString();
    const newQuery: AssistantQuery = {
      id: queryId,
      query,
      response: null,
      timestamp: new Date(),
    };

    setQueries((prev) => [newQuery, ...prev]);

    try {
      await ask(query);
      // Update query with response
      setQueries((prev) =>
        prev.map((q) =>
          q.id === queryId
            ? {
                ...q,
                response: answer ? { answer, mode: 'local', latency_seconds: latency || 0 } : null,
              }
            : q
        )
      );
    } catch (err) {
      // Update query with error
      setQueries((prev) =>
        prev.map((q) =>
          q.id === queryId ? { ...q, error: error || 'Unknown error' } : q
        )
      );
    }
  };

  const handleRemove = (id: string) => {
    setQueries((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Local AI Assistant</h1>
          <p className="text-gray-600 mt-2">
            Privacy-aware, local-first AI with built-in verification
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                backendStatus === 'offline' ? 'bg-red-500' : 'bg-green-500'
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              Backend: <span className="font-semibold">{backendStatus}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <QueryInput onSubmit={handleSubmit} isLoading={loading} />
          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 text-blue-600 mr-2">⚙️</div>
              <span className="text-gray-600">Asking the assistant...</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {queries.length === 0 ? 'No queries yet' : `${queries.length} query/queries`}
          </h2>
          {queries.map((query) => (
            <QueryResult key={query.id} query={query} onRemove={handleRemove} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            Built with React + Tailwind • Backend running on{' '}
            <code className="bg-gray-200 px-2 py-1 rounded">localhost:8000</code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
