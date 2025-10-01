'use client';

import dynamic from 'next/dynamic';

// Loading component removed - unused

// Lazy load HospitalTable avec loading optimisé
export const LazyHospitalTable = dynamic(() => import('./HospitalTable'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// Lazy load TimelineControl avec loading optimisé
export const LazyTimelineControl = dynamic(() => import('./TimelineControl'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  ),
});

// Lazy load HospitalDetail avec loading optimisé
export const LazyHospitalDetail = dynamic(() => import('./HospitalDetail'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// Lazy load des utilitaires d'export
export const LazyExportUtils = {
  exportToPDF: () => import('../utils/export-utils').then(mod => mod.exportToPDF),
  exportToCSV: () => import('../utils/export-utils').then(mod => mod.exportToCSV),
  exportToJSON: () => import('../utils/export-utils').then(mod => mod.exportToJSON),
  exportFilteredHospitals: () =>
    import('../utils/export-utils').then(mod => mod.exportFilteredHospitals),
};

// Type helpers pour les exports
export type ExportFunction = (...args: any[]) => Promise<void>;
export type ExportUtilsType = typeof LazyExportUtils;
