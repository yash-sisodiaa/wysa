import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Chat from './Chat';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <Routes>
          <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <Chat /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
