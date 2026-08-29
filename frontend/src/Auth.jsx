import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Username" 
          className="p-3 bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-white"
          value={username} onChange={e => setUsername(e.target.value)} required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="p-3 bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition text-white"
          value={password} onChange={e => setPassword(e.target.value)} required 
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-semibold transition mt-2">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-slate-400 text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline">
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
}
