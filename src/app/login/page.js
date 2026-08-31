'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoginSequenceExecution(e) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Authentication execution rejected.");
      }
      
      localStorage.setItem('username', data.username);
      
      router.push('/'); 
      router.refresh();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brandNavy px-4 text-slate-200">
      <div className="w-full max-w-md bg-surfaceCard border border-slate-800 rounded-lg p-8 shadow-2xl">
        <h2 className="text-2xl font-mono tracking-wide text-white font-bold text-center mb-6">Terminal Sign In</h2>
        
        {errorMessage && (
          <div className="mb-4 bg-red-950/40 border border-red-900 text-red-400 p-3 rounded text-xs text-center">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleLoginSequenceExecution} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1 font-bold">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-brandNavy border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1 font-bold">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-brandNavy border border-slate-800 rounded p-3 text-white focus:outline-none focus:border-blue-500" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-800 text-white font-bold uppercase rounded transition-colors">
            {isLoading ? "PROCESSING..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
