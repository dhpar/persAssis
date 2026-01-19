import React, { useState } from 'react';
import { useAssistant } from '../hooks/useAssistant';

interface QueryInputProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading?: boolean;
}

export const QueryInput: React.FC<QueryInputProps> = ({ onSubmit, isLoading = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await onSubmit(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI assistant anything..."
          disabled={isLoading}
          className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Asking...' : 'Ask'}
        </button>
      </div>
    </form>
  );
};

export default QueryInput;
