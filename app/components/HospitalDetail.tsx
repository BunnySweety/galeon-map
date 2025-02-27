// File: app/components/HospitalDetail.tsx
'use client';

import { useLingui } from '@lingui/react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Hospital } from '../store/useMapStore';

interface HospitalDetailProps {
  hospital: Hospital | null;
  className?: string;
}

const HospitalDetail: React.FC<HospitalDetailProps> = ({ 
  hospital, 
  className = '' 
}) => {
  const { i18n } = useLingui();
  
  // Create a safe translation function that handles undefined i18n
  const _ = (text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  };

  if (!hospital) return null;

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="relative w-full h-40" style={{ height: '160px' }}>
        <Image 
          src={hospital.imageUrl} 
          alt={hospital.name} 
          fill
          sizes="100%"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{hospital.name}</h2>
        <div className="mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
            ${hospital.status === 'Deployed' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
            {_(hospital.status)} {_('on')} {format(new Date(hospital.deploymentDate), 'dd/MM/yyyy')}
          </span>
        </div>
        <div className="flex space-x-2">
          <a 
            href={hospital.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-500 rounded text-center hover:bg-blue-100"
          >
            {_('Website')}
          </a>
          <button 
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-500 rounded hover:bg-blue-100"
            onClick={() => alert(hospital.address)}
          >
            {_('Address')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetail;