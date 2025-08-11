'use client';

import { useState, useCallback, useMemo } from 'react';
import { useLingui } from '@lingui/react';
import { useMobileContext } from './MobileProvider';
import { useMapStore } from '../../store/useMapStore';
import { Hospital } from '../../api/hospitals/data';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export default function MobileHospitalList() {
  const { i18n } = useLingui();
  const { filters, searchQuery, viewMode } = useMobileContext();
  const { hospitals } = useMapStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

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

  // Filtrer et trier les hôpitaux
  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter(hospital => {
        // Filtre par statut
        if (!filters.deployed && hospital.status === 'Deployed') return false;
        if (!filters.signed && hospital.status === 'Signed') return false;
        
        // Sur mobile, ne pas filtrer par date - afficher tous les hôpitaux
        // if (new Date(hospital.deploymentDate) > new Date(currentDate)) return false;
        
        // Filtre par recherche
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            hospital.name.toLowerCase().includes(query) ||
            hospital.address.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.deploymentDate).getTime() - new Date(a.deploymentDate).getTime());
  }, [hospitals, filters, searchQuery]);

  // Virtual scrolling pour optimiser les performances
  const rowVirtualizer = useVirtualizer({
    count: filteredHospitals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => viewMode === 'compact' ? 80 : 120,
    overscan: 5,
  });

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const HospitalCard = ({ hospital, index }: { hospital: Hospital; index: number }) => {
    const isExpanded = expandedId === hospital.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden"
      >
        <button
          onClick={() => handleToggleExpand(hospital.id)}
          className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Hospital Name & Status */}
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-white font-medium text-base flex-1">
                  {hospital.name}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  hospital.status === 'Deployed'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {_(hospital.status)}
                </span>
              </div>

              {/* Address */}
              <p className="text-slate-400 text-sm mb-2 line-clamp-1">
                {hospital.address}
              </p>

              {/* Date */}
              <p className="text-slate-500 text-xs">
                {new Date(hospital.deploymentDate).toLocaleDateString(i18n.locale || 'fr', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Expand Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 mt-1"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-700/50"
            >
              <div className="p-4 space-y-3">
                {/* Hospital Image */}
                {hospital.imageUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-700/30">
                    <Image
                      src={hospital.imageUrl}
                      alt={hospital.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://maps.google.com/?q=${hospital.coordinates.join(',')}`, '_blank');
                    }}
                    className="flex-1 py-2 px-3 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    {_('Navigate')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(hospital.website, '_blank');
                    }}
                    className="flex-1 py-2 px-3 bg-slate-700/50 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700/70 transition-colors"
                  >
                    {_('Website')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (filteredHospitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-white font-medium text-lg mb-2">{_('No hospitals found')}</h3>
        <p className="text-slate-400 text-sm text-center">
          {searchQuery 
            ? _('Try adjusting your search or filters')
            : _('Try adjusting your filters')
          }
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900">
      {/* Header Stats */}
      <div className="px-4 py-3 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <p className="text-white font-medium">
            {filteredHospitals.length} {_('hospitals')}
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-blue-400">
              {filteredHospitals.filter(h => h.status === 'Deployed').length} {_('deployed')}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-green-400">
              {filteredHospitals.filter(h => h.status === 'Signed').length} {_('signed')}
            </span>
          </div>
        </div>
      </div>

      {/* Virtual List */}
      <div ref={parentRef} className="h-full overflow-auto p-4 space-y-3">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const hospital = filteredHospitals[virtualItem.index];
            if (!hospital) return null;
            return (
              <div
                key={hospital.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <HospitalCard hospital={hospital} index={virtualItem.index} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
