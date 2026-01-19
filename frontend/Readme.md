# Local AI Assistant - Frontend

A modern React + TypeScript frontend for the Local AI Assistant backend.

## Features

- Clean, intuitive interface for querying the AI assistant
- Real-time query/response display with latency tracking
- Backend health status indicator
- Responsive design with Tailwind CSS
- TypeScript for type safety
- React Router for navigation
- Axios for API communication

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Running in Development

```bash
npm start
```

The app will open at `http://localhost:3000`

Ensure the backend is running on `http://localhost:8000` (see [backend/](../backend/))

### Building for Production

```bash
npm build
```

Output will be in `build/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── QueryInput.tsx   # Form for submitting queries
│   │   └── QueryResult.tsx  # Display query results
│   ├── pages/               # Page components
│   │   └── Home.tsx         # Main home page
│   ├── hooks/               # Custom React hooks
│   │   └── useAssistant.ts  # Hook for querying the assistant
│   ├── services/            # API client
│   │   └── api.ts           # Axios API wrapper
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # React entry point
│   ├── index.css            # Global styles + Tailwind
│   └── vite-env.d.ts        # Vite environment types
├── public/                  # Static assets
│   └── index.html           # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── Readme.md               # This file
```

## Available Components

### QueryInput
Form component for submitting queries to the assistant.

```tsx
<QueryInput onSubmit={handleSubmit} isLoading={loading} />
```

### QueryResult
Displays a single query result with metadata.

```tsx
<QueryResult query={queryData} onRemove={handleRemove} />
```

## Custom Hooks

### useAssistant()
Hook for managing API calls to the assistant.

```tsx
const { answer, loading, error, latency, ask } = useAssistant();
await ask("Your query here");
```

## API Integration

The frontend communicates with the backend via the `api` service:

```typescript
import { api } from './services/api';

// Query the assistant
const response = await api.ask("Write a Python function");

// Check backend health
const health = await api.health();
```

## Configuration

The API client defaults to `http://localhost:8000`. To change this:

```typescript
import APIClient from './services/api';
const customClient = new APIClient('http://your-backend-url:8000');
```

## Environment Variables

Create a `.env` file to override defaults:

```
REACT_APP_API_URL=http://localhost:8000
```

## Styling

The project uses **Tailwind CSS** for styling. Customize by editing:
- `src/index.css` - Global styles and Tailwind imports
- Component className attributes - Inline Tailwind utilities

## See Also

- Backend: [../backend/](../backend/)
- Root README: [../Readme.md](../Readme.md)
