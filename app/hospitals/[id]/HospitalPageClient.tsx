'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Providers } from '../../providers';

// Dynamic import du composant principal avec loading optimisé
const HospitalDetailClient = dynamic(() => import('./HospitalDetailClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Hospital Details</h2>
        <p className="text-gray-500">Please wait while we load the hospital information...</p>
      </div>
    </div>
  ),
});

interface HospitalPageClientProps {
  hospitalId: string;
}

export default function HospitalPageClient({ hospitalId }: HospitalPageClientProps) {
  return (
    <Providers enableQuery={true}>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Initializing Hospital View</h2>
              <p className="text-gray-500">Setting up the hospital details page...</p>
            </div>
          </div>
        }
      >
        <HospitalDetailClient hospitalId={hospitalId} />
      </Suspense>
    </Providers>
  );
} 