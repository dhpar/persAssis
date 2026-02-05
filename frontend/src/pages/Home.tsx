import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QueryInput } from '../components/QueryInput';
import { QueryResult } from '../components/QueryResult';
import { AssistantQuery } from '../types';
import { useGetHealthAPI, usePromptQuestionAPI } from '../services/api';

export const Home: React.FC = () => {
  const [queries, setQueries] = useState<AssistantQuery[]>([]);
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [loading, setLoading] = useState<boolean>(false);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await useGetHealthAPI();
        setBackendStatus(`${health.status} (${health.data.mode})`);
      } catch (err) {
        setBackendStatus('offline');
      }
    };
    
    checkHealth();
  }, []);

  const handleSubmit = async (query: string) => {
    const queryId = Date.now().toString();
    setLoading(true);
    try {
      const response = await usePromptQuestionAPI({ query });
      // Update query with response
      const responseQuery = {
            id: queryId,
            query,
            response: response.data,
            timestamp: new Date(),
      };

      setQueries((prev) => [...prev, responseQuery]);
      setLoading(false);
    } catch (err) {
      const responseQuery = {
            id: queryId,
            query,
            error: err instanceof Error ? err : 'Unknown error',
            timestamp: new Date(),
      };
      
      setQueries((prev) => [...prev, responseQuery]);
      setLoading(false);
    }
  };

  const handleRemove = (queryId: string) => {
    setQueries((prev) => prev.filter(({id}) => id !== queryId));
  };
  
  return (
   <>
      {/* Main Content */}
      <main className=" mx-auto px-4 py-8 min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex-1">
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
            <nav className="flex gap-2">
              <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Chat
              </Link>
              <Link
                to="/prompts"
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 font-medium"
              >
                Manage Prompts
              </Link>
            </nav>
          </div>
        </header>
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
        {/* Footer */}
        <footer className="bg-gray-100 border-t border-gray-200 mt-12 py-6">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
            <p>
              Built with React + Tailwind • Backend running on{' '}
              <code className="bg-gray-200 px-2 py-1 rounded">localhost:8000</code>
            </p>
          </div>
        </footer>
      </main>

   </>
  );
};

export default Home;
