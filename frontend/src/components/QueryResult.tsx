import React from 'react';
import { AssistantQuery } from '../types';
import Markdown from 'react-markdown'
interface QueryResultProps {
  request: AssistantQuery;
  onRemove: (id: string) => void;
}

export const QueryResult: React.FC<QueryResultProps> = ({ request, onRemove }) => {
  const {response, error, query, id, timestamp} = request;
  
  if (!response) {
    return null;
  }

  if (error) {
    <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
      <p className="font-semibold">Error</p>
      <p className="text-sm">{error.toString()}</p>
    </div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 grow">{query}</h3>
        <button
          onClick={() => onRemove(id)}
          className="ml-2 text-gray-400 hover:text-gray-600 text-lg"
        >
          ×
        </button>
      </div>
      <div className="bg-gray-50 rounded p-4 mb-3">
        <p className="text-gray-800 whitespace-pre-wrap">
          <Markdown>{response.answer}</Markdown>
        </p>
      </div>
      <div className="flex gap-4 text-xs text-gray-600">
        <span>
          Mode: 
          <span className="font-semibold">{response.mode}</span>
        </span>
        <span>
          Latency: 
          <span className="font-semibold">{response.latency_seconds}s</span>
        </span>
        <span>Time: 
          <span className="font-semibold">{timestamp.toLocaleTimeString()}</span>
        </span>
      </div>
      
    </div>
  );
};

export default QueryResult;
