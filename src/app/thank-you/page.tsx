'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!slug) return;

    // Countdown timer for display only
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Navigation timer - separate from state updates
    const navTimer = setTimeout(() => {
      router.push(`/admin/${slug}`);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(navTimer);
    };
  }, [slug, router]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">Your action was successful.</p>
          <Link href="/" className="text-indigo-600 hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Success!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Your shop is ready. Redirecting you to the dashboard...
        </p>

        <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium mb-6">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Redirecting in {countdown}s</span>
        </div>

        <Link 
          href={`/admin/${slug}`}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard Now <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
