'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ClaimShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying claim...');
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const init = async () => {
        const resolvedParams = await params;
        setSlug(resolvedParams.slug);
    };
    init();
  }, [params]);

  useEffect(() => {
    if (!slug || !code) return;

    if (isPending) return;

    if (!session) {
      // Should have been handled by middleware or redirect, but just in case
      router.push(`/auth?callbackUrl=${encodeURIComponent(`/claim/${slug}?code=${code}`)}`);
      return;
    }

    const claimShop = async () => {
      try {
        const res = await fetch('/api/claim-shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, code })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Shop claimed successfully! Redirecting to dashboard...');
          setTimeout(() => {
            router.push(`/admin/${slug}`);
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to claim shop');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    claimShop();
  }, [slug, code, session, isPending, router]);

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">Missing claim code.</p>
          <Link href="/" className="text-indigo-600 hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Claiming Shop...</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/" className="text-indigo-600 hover:underline">Go Home</Link>
          </>
        )}
      </div>
    </div>
  );
}
