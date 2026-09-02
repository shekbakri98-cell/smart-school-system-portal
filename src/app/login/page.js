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
      if (!response.ok) throw new Error(data.error || "Authentication execution rejected.");
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] px-4 text-slate-200 font-mono">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-[#141b2d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* LEFT SIDE: PROUD INSTITUTIONAL SPLASH PANEL */}
        <div className="p-8 flex flex-col justify-between bg-gradient-to-br from-blue-900/40 via-brandNavy to-brandNavy border-b md:border-b-0 md:border-r border-slate-800 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏛️</span>
              <span className="text-white font-black tracking-wider uppercase text-sm">Sheek Bakri Secondary</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px] pt-1">
              Welcome to the central information administration hub network interface portal. Secure core nodes monitor student progress parameters live.
            </p>
          </div>
          
          <div className="mt-8 md:mt-0 space-y-1 bg-black/20 p-3 rounded border border-slate-800/60">
            <p className="text-brandGold font-bold text-[10px] uppercase tracking-wider">Localized School Motto:</p>
            <p className="text-slate-300 italic text-[11px]">"Empowering minds through structural modern education benchmarks, constructing automated engineering timelines for secondary scholars."</p>
          </div>

          <div className="text-[10px] text-slate-500 pt-4 md:pt-0">
            // Core Cryptographic Salting Active
          </div>
        </div>

        {/* RIGHT SIDE: INTERACTIVE SIGN IN FORM */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider text-center mb-6 border-b border-slate-800 pb-2">Terminal Access Sign-In</h2>
          
          {errorMessage && (
            <div className="mb-4 bg-red-950/40 border border-red-900 text-red-400 p-2.5 rounded text-[11px] text-center">
              ⚠️ {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleLoginSequenceExecution} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-slate-400 mb-1 font-bold text-[10px]">Security Access Email</label>
              <input 
                type="email" 
                required 
                placeholder="e.g. admin@hub.edu"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-slate-400 mb-1 font-bold text-[10px]">Authorization Key Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase rounded font-mono text-xs tracking-wider transition-colors shadow-md disabled:bg-blue-800"
            >
              {isLoading ? "Validating Tokens..." : "Establish Connection 📡"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
