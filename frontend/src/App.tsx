import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PromptsManager from './pages/PromptsManager';

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompts" element={<PromptsManager />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
