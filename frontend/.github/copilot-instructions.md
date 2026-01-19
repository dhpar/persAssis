# Copilot Instructions for Local AI Assistant - Frontend

## Project Overview
A modern React + TypeScript frontend for the Local AI Assistant backend. The frontend provides a clean, responsive interface for querying the AI assistant with real-time results display, latency tracking, and backend health monitoring.

**Stack**: React 18, TypeScript, Tailwind CSS, React Router, Axios

## Architecture

```
User Input (QueryInput Component)
    ↓
useAssistant Hook (manages state)
    ↓
api.ask() (Axios call to /prompt)
    ↓
Backend (localhost:8000)
    ↓
Response displayed in QueryResult Component
```

**Key Files**:
- [src/App.tsx](src/App.tsx) - Main app component with routing
- [src/pages/Home.tsx](src/pages/Home.tsx) - Home page with full query interface
- [src/components/QueryInput.tsx](src/components/QueryInput.tsx) - Input form component
- [src/components/QueryResult.tsx](src/components/QueryResult.tsx) - Result display component
- [src/hooks/useAssistant.ts](src/hooks/useAssistant.ts) - Custom hook for API calls
- [src/services/api.ts](src/services/api.ts) - Axios wrapper for backend communication
- [src/types/index.ts](src/types/index.ts) - TypeScript type definitions

## Critical Patterns

### 1. Custom Hook Pattern
All API communication flows through `useAssistant` hook:

```typescript
const { answer, loading, error, latency, ask } = useAssistant();
await ask("user query");
```

Benefits: Centralized state management, reusable across components, clean separation of concerns.

### 2. Strongly Typed API Layer
API service exports both request/response interfaces and a singleton instance:

```typescript
import { api, PromptResponse } from './services/api';
const response: PromptResponse = await api.ask(query);
```

All API calls are typed; TS compiler catches mismatches.

### 3. Component Composition
- **Presentational components** (QueryInput, QueryResult) receive props and callbacks
- **Page components** (Home) manage state and orchestrate data flow
- **Hooks** (useAssistant) handle side effects (API calls)

Example:
```tsx
const Home: React.FC = () => {
  const { ask, loading, error } = useAssistant();
  return <QueryInput onSubmit={ask} isLoading={loading} />;
};
```

### 4. Error Handling & Loading States
Every component handles three states:

```typescript
// In useAssistant:
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// In components:
{loading && <span>Asking...</span>}
{error && <div className="text-red-600">{error}</div>}
{answer && <div>{answer}</div>}
```

### 5. Tailwind CSS Conventions
- Use utility classes for styling (no custom CSS for common patterns)
- Responsive: `md:`, `lg:` prefixes for breakpoints
- Color scheme: Blue primary (`blue-600`), gray neutrals (`gray-100` to `gray-900`)
- Spacing: Consistent use of Tailwind gap, p, m, px, py utilities

Example:
```tsx
<div className="flex gap-2 px-4 py-3 bg-white rounded-lg shadow-md">
  {/* content */}
</div>
```

## Development Workflow

### Running the Frontend
```bash
cd frontend
npm install
npm start
```

Runs at `http://localhost:3000`

Ensure backend is also running on `http://localhost:8000`:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Adding a New Component

1. Create file in `src/components/` or `src/pages/`
2. Use React.FC<Props> type annotation
3. Define Props interface with TypeScript
4. Use Tailwind classes for styling
5. Import and use in parent component

Example:
```tsx
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded">
      {title}
    </button>
  );
};
```

### Adding a New Hook

1. Create file in `src/hooks/`
2. Prefix with `use` (React convention)
3. Return typed object with state/callbacks
4. Handle loading, error, success states

Example:
```tsx
// src/hooks/useMyFeature.ts
export const useMyFeature = () => {
  const [data, setData] = useState<MyType | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fetch = async () => {
    setLoading(true);
    try {
      const result = await api.getMyFeature();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, fetch };
};
```

### Extending the API Service

Add new methods to the APIClient class in `src/services/api.ts`:

```typescript
async myNewEndpoint(param: string): Promise<MyResponse> {
  const response = await this.client.post<MyResponse>('/my-endpoint', { param });
  return response.data;
}
```

Export request/response types:
```typescript
export interface MyRequest {
  param: string;
}

export interface MyResponse {
  result: string;
}
```

## Build Optimization

### Production Build
```bash
npm run build
```

Creates optimized bundle in `build/` directory with:
- Code splitting
- Minification
- Source maps for debugging

### TypeScript Strict Mode
All files use strict TypeScript (tsconfig.json):
- `strict: true` - Full type checking
- `noUnusedLocals: true` - Catch dead code
- `noUnusedParameters: true` - Catch unused params

## Debugging Tips

- **Backend offline**: Check backend runs on localhost:8000, or update API baseURL
- **API types mismatch**: Ensure response interface matches backend endpoint
- **Tailwind classes not applied**: Clear cache: `npm run build && npm start`
- **TypeScript errors in JSX**: Use `React.FC<Props>` and destructure with types
- **Hooks state not updating**: Check dependencies array in useEffect calls

## Project Dependencies

- **react** / **react-dom** - UI library
- **react-router-dom** - Client-side routing (6.x)
- **axios** - HTTP client for API calls
- **tailwindcss** - Utility-first CSS framework
- **typescript** - Type safety
- **react-scripts** - Build and dev server (create-react-app)

## When Adding Features

- **New Query Type**: Extend `PromptResponse` in `src/types/` and handle in `QueryResult`
- **New UI Page**: Create in `src/pages/`, add route in `App.tsx`
- **Backend Connection**: Add method to `APIClient` in `src/services/api.ts`
- **Shared State**: Consider custom hook in `src/hooks/` instead of prop drilling

## See Also

- Backend: [../backend/](../backend/)
- Root README: [../Readme.md](../Readme.md)
