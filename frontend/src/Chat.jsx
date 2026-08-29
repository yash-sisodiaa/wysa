import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Chat() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadQuestion = async (url) => {
    try {
      setLoading(true);
      setWarning('');
      const res = await axios.get(url, { headers });
      setQuestion(res.data.question);
      setCanGoBack(res.data.canGoBack || false);
      setSelectedOptionId(null);
      if (res.data.warning) setWarning(res.data.warning);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const qId = searchParams.get('question');
    
    if (qId) {
      loadQuestion(`http://localhost:5000/api/flow/question/${qId}`);
    } else {
      loadQuestion('http://localhost:5000/api/flow/start');
    }
  }, []);

  const handleOptionSelect = async (optionId) => {
    if (!question) return;
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/flow/answer', {
        questionId: question._id,
        optionId
      }, { headers });
      setQuestion(res.data.question);
      setCanGoBack(res.data.canGoBack || false);
      setSelectedOptionId(null);
      window.history.pushState({}, '', '/');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error submitting answer');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/flow/back', {}, { headers });
      setQuestion(res.data.question);
      setCanGoBack(res.data.canGoBack || false);
      setSelectedOptionId(res.data.previouslySelectedOptionId || null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error going back');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  return (
    <div className="w-full max-w-2xl bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-700 relative">
      <div className="absolute top-4 right-6 flex gap-4">
        {canGoBack && (
          <button onClick={handleBack} className="text-sm text-blue-400 hover:text-blue-300 transition">
            &larr; Go Back
          </button>
        )}
        <button onClick={logout} className="text-sm text-slate-400 hover:text-white transition">
          Logout
        </button>
      </div>

      {warning && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 rounded-xl">
          {warning}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48 animate-pulse text-slate-500">
          Loading...
        </div>
      ) : !question ? (
        <div className="text-center h-48 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-white mb-2">Conversation Finished</h2>
          <p className="text-slate-400">You have reached the end of this flow.</p>
        </div>
      ) : (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white leading-tight">
              {question.text}
            </h1>
          </div>
          
          <div className="flex flex-col gap-3 mt-auto">
            {question.options.map(option => {
              const isSelected = option._id === selectedOptionId;
              return (
                <button
                  key={option._id}
                  onClick={() => handleOptionSelect(option._id)}
                  className={`w-full text-left p-4 rounded-xl transition-all shadow-sm text-lg border ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-500 shadow-md' 
                      : 'bg-slate-700/50 border-slate-600 hover:bg-blue-600/50 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
