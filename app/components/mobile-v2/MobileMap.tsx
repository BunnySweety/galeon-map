'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLingui } from '@lingui/react';
import { useMobileContext } from './MobileProvider';
import { useMapStore } from '../../store/useMapStore';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

// Utiliser le vrai composant MapWrapperCDN
const MapWrapperCDN = dynamic(() => import('../MapWrapperCDN'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

export default function MobileMap() {
  const { i18n } = useLingui();
  const [showHospitalDetail, setShowHospitalDetail] = useState(false);
  const { selectedHospital, setSelectedHospital, filters, searchQuery } = useMobileContext();
  const { hospitals, selectedHospital: mapSelectedHospital } = useMapStore();

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

  // Sur mobile, toujours afficher tous les hôpitaux
  const displayedHospitals = hospitals;

  // Synchroniser l'hôpital sélectionné avec le store global
  useEffect(() => {
    if (mapSelectedHospital) {
      // Si c'est le même hôpital et que le panneau est fermé, le réouvrir
      if (selectedHospital?.id === mapSelectedHospital.id && !showHospitalDetail) {
        setShowHospitalDetail(true);
      } else {
        // Sinon, mettre à jour l'hôpital et ouvrir le panneau
        setSelectedHospital(mapSelectedHospital);
        setShowHospitalDetail(true);
      }
    }
  }, [mapSelectedHospital, setSelectedHospital, selectedHospital, showHospitalDetail]);

  // Gérer le glissement vers le bas pour fermer le panneau
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    // Si glissé vers le bas avec une certaine vitesse ou déplacé de plus de 50px
    if (info.velocity.y > 500 || info.offset.y > 50) {
      setShowHospitalDetail(false);
      // Ne pas effacer la sélection pour permettre la réouverture
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-slate-900 overflow-hidden">
      {/* Carte Mapbox - Prend tout l'espace */}
      <MapWrapperCDN />

      {/* Stats Overlay - En haut à gauche */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-slate-700/50">
          <p className="text-white text-sm font-medium">
            {displayedHospitals.length} {_('hospitals')}
          </p>
        </div>
      </div>



      {/* Hospital Detail Sheet - Version Améliorée */}
      <AnimatePresence>
        {showHospitalDetail && selectedHospital && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.8 }}
            onDragEnd={handleDragEnd}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-[4.5rem] left-0 right-0 mx-2 bg-gradient-to-b from-slate-900 to-slate-800 backdrop-blur-xl rounded-t-3xl rounded-b-xl shadow-2xl z-30 border border-slate-700/30 overflow-hidden"
            style={{ maxHeight: '40vh' }}
          >
            {/* Poignée de glissement */}
            <div className="py-3 px-4 cursor-grab active:cursor-grabbing">
              <div className="w-16 h-1.5 bg-slate-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(40vh - 3rem)' }}>
              {/* Image de l'hôpital si disponible */}
              {selectedHospital.imageUrl && (
                <div className="mb-3 -mx-4">
                  <img 
                    src={selectedHospital.imageUrl} 
                    alt={selectedHospital.name}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* En-tête avec nom et bouton fermer */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="text-white font-semibold text-lg leading-tight mb-1">
                    {selectedHospital.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs truncate">{selectedHospital.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowHospitalDetail(false);
                    // Ne pas effacer la sélection pour permettre la réouverture
                  }}
                  className="p-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  aria-label={_('Close')}
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Statut et Date compacts */}
              <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 mb-3 border border-slate-700/30">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                    selectedHospital.status === 'Deployed'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {_(selectedHospital.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">
                    {new Date(selectedHospital.deploymentDate).toLocaleDateString(i18n.locale || 'fr', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Boutons d'action simplifiés */}
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(selectedHospital.website, '_blank')}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>{_('Website')}</span>
                </button>
                
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${selectedHospital.coordinates.join(',')}`, '_blank')}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-slate-700/70 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-600/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{_('Directions')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}