'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MembresRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la bonne page dans le dashboard
    router.push('/dashboard/membres');
  }, [router]);

  return null;
}