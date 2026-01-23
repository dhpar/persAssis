import React from 'react';
import { AssistantQuery } from '../types';
import Markdown from 'react-markdown'
interface QueryResultProps {
  query: AssistantQuery;
  onRemove: (id: string) => void;
}

export const QueryResult: React.FC<QueryResultProps> = ({ query, onRemove }) => {
  if (!query.response && !query.error) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 flex-grow">{query.query}</h3>
        <button
          onClick={() => onRemove(query.id)}
          className="ml-2 text-gray-400 hover:text-gray-600 text-lg"
        >
          ×
        </button>
      </div>

      {query.error ? (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{query.error.toString()}</p>
        </div>
      ) : query.response ? (
        <>
          <div className="bg-gray-50 rounded p-4 mb-3">
            <p className="text-gray-800 whitespace-pre-wrap"><Markdown>{query.response.answer}</Markdown></p>
          </div>
          <div className="flex gap-4 text-xs text-gray-600">
            <span>Mode: <span className="font-semibold">{query.response.mode}</span></span>
            <span>Latency: <span className="font-semibold">{query.response.latency_seconds}s</span></span>
            <span>Time: <span className="font-semibold">{query.timestamp.toLocaleTimeString()}</span></span>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default QueryResult;
