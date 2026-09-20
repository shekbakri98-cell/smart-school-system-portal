'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirectNode() {
  const router = useRouter();

  useEffect(() => {
    // Immediately pushes the browser history stack to the clean root domain route path
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center font-mono text-xs text-slate-500">
      📡 Routing to core server node portal...
    </div>
  );
}
