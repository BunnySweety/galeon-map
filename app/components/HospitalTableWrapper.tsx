'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import de HospitalTable avec loading optimisé
const HospitalTable = dynamic(() => import('./HospitalTable'), {
  ssr: false,
  loading: () => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Table skeleton */}
        <div className="hidden md:block">
          {/* Table headers */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          
          {/* Table rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 mb-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded"></div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Mobile cards skeleton */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-40"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

interface HospitalTableWrapperProps {
  className?: string;
}

export default function HospitalTableWrapper({ className }: HospitalTableWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      }
    >
      <HospitalTable className={className || ''} />
    </Suspense>
  );
} 