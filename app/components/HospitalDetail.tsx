// File: app/components/HospitalDetail.tsx
'use client';

import { useLingui } from '@lingui/react';
import { format } from 'date-fns/format';
import { useCallback } from 'react';
import Image from 'next/image';
import { openDirections } from '../utils/navigation-utils';
// Types importés depuis le fichier centralisé
import type { HospitalDetailProps } from '../types';

const HospitalDetail: React.FC<HospitalDetailProps> = ({ hospital, className = '' }) => {
  const { i18n } = useLingui();

  // Create a safe translation function that handles undefined i18n
  const _ = useCallback(
    (text: string) => {
      try {
        return i18n?._ ? i18n._(text) : text;
      } catch {
        return text;
      }
    },
    [i18n]
  );

  // Fonction pour ouvrir l'itinéraire (simple version)
  const handleGetDirections = useCallback(() => {
    if (!hospital) return;

    const hospitalName = i18n.locale === 'fr' ? hospital.nameFr : hospital.nameEn;
    openDirections(hospital.coordinates, hospitalName);
  }, [hospital, i18n.locale]);

  // Handlers pour les effets de survol optimisés
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(55, 65, 81, 1)';
    e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 1)';
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(75, 85, 99, 0.8)';
    e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.5)';
  }, []);

  if (!hospital) return null;

  // Définir la couleur en fonction du statut
  const statusColor =
    hospital.status === 'Deployed' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500';
  const dotColor = hospital.status === 'Deployed' ? 'bg-blue-500' : 'bg-green-500';

  // Récupérer le nom de l'hôpital en fonction de la langue actuelle
  const hospitalName = i18n.locale === 'fr' ? hospital.nameFr : hospital.nameEn;

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      role="article"
      aria-label={_('Hospital details')}
    >
      <div
        className="relative w-full"
        style={{ height: '120px' }}
        role="img"
        aria-label={hospitalName}
      >
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
          sizes="(max-width: 768px) 100vw, 320px"
          className="gradient-mask"
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
      <div className="p-3 md:p-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2" style={{ wordBreak: 'break-word' }}>
          {hospitalName}
        </h2>
        <div className="mb-3 md:mb-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColor}`}
          >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${dotColor}`}></span>
            {_(hospital.status)} {_('on')} {format(new Date(hospital.deploymentDate), 'dd/MM/yyyy')}
          </span>
          {hospital.hasDPI && (
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-600"
              aria-label={_('DPI_tooltip')}
              title={_('DPI_tooltip')}
            >
              {i18n.locale === 'en' ? 'EHR' : 'DPI'}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-2.5">
          <a
            href={hospital.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={_('Visit') + ' ' + hospitalName + ' ' + _('website')}
            className="flex-1 h-11 flex flex-row justify-center items-center px-4 py-3 gap-2.5 text-white rounded-[10px] transition-colors hover:brightness-110"
            style={{
              background: '#479AF3',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              minWidth: '44px',
              minHeight: '44px',
              touchAction: 'manipulation',
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            {_('Website')}
          </a>
          <button
            className="flex-1 h-11 flex flex-row justify-center items-center px-4 py-3 gap-2.5 text-white rounded-[10px] transition-all duration-200"
            style={{
              background: 'rgba(75, 85, 99, 0.8)',
              border: '1px solid rgba(156, 163, 175, 0.5)',
              backdropFilter: 'blur(10px)',
              minWidth: '44px',
              minHeight: '44px',
              touchAction: 'manipulation',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleGetDirections}
            aria-label={_('Get directions to') + ' ' + hospitalName}
            title={_('Get directions to') + ' ' + hospitalName}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            {i18n.locale === 'fr' ? 'Itinéraire' : 'Directions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetail;
