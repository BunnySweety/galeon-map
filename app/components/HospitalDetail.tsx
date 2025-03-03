// File: app/components/HospitalDetail.tsx
'use client';

import { useLingui } from '@lingui/react';
import { format } from 'date-fns';
import { useCallback } from 'react';
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
  const _ = useCallback((text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  }, [i18n]);

  if (!hospital) return null;

  // Définir la couleur en fonction du statut
  const statusColor = hospital.status === 'Deployed' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500';
  const dotColor = hospital.status === 'Deployed' ? 'bg-blue-500' : 'bg-green-500';

  // Récupérer le nom de l'hôpital en fonction de la langue actuelle
  const hospitalName = i18n.locale === 'fr' ? hospital.nameFr : hospital.nameEn;

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="relative w-full" style={{ height: '160px' }}>
        <style jsx global>{`
          .gradient-mask {
            mask-image: linear-gradient(to top, transparent, black 50%);
            -webkit-mask-image: linear-gradient(to top, transparent, black 50%);
          }
        `}</style>
        <Image 
          src={hospital.imageUrl} 
          alt={hospitalName} 
          fill
          sizes="100%"
          className="gradient-mask"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2" style={{ wordBreak: 'break-word' }}>{hospitalName}</h2>
        <div className="mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColor}`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${dotColor}`}></span>
            {_(hospital.status)} {_('on')} {format(new Date(hospital.deploymentDate), 'dd/MM/yyyy')}
          </span>
        </div>
        <div className="flex space-x-2">
          <a 
            href={hospital.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-center hover:bg-blue-600 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            {_('Website')}
          </a>
          <button 
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center justify-center"
            onClick={() => alert(hospital.address)}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {_('Address')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetail;