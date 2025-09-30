// File: app/components/map/HospitalMarkers.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '@lingui/react';
import HospitalDetail from '../HospitalDetail';
import logger from '../../utils/logger';
import type { Hospital } from '../../types';

interface HospitalMarkersProps {
  mapRef: React.MutableRefObject<any>;
  mapboxgl: any;
  mapLoaded: boolean;
  hospitals: Hospital[];
  filteredHospitals: Hospital[];
  currentDate: string;
  selectedFilters: { deployed: boolean; signed: boolean };
  timelineIndex: number;
  timelineLength: number;
  selectHospital: (hospital: Hospital | null) => void;
  i18n: any;
}

export const useHospitalMarkers = ({
  mapRef,
  mapboxgl: _mapboxgl,
  mapLoaded,
  hospitals: _hospitals,
  filteredHospitals,
  currentDate,
  selectedFilters: _selectedFilters,
  timelineIndex,
  timelineLength,
}: Omit<HospitalMarkersProps, 'selectHospital' | 'i18n'>) => {
  
  // Update displayed hospitals based on current date and filters
  useEffect(() => {
    if (!mapRef.current || !filteredHospitals || !mapLoaded) {
      return;
    }

    const source = mapRef.current.getSource('hospitals') as any;
    if (!source) {
      return;
    }

    try {
      // Use filteredHospitals from store (already filtered by status, date, and search)
      // Just apply date filter for timeline progression
      const dateFiltered = filteredHospitals.filter(hospital => {
        try {
          const current = new Date(currentDate);
          current.setUTCHours(0, 0, 0, 0);
          const hospitalDate = new Date(hospital.deploymentDate);
          hospitalDate.setUTCHours(0, 0, 0, 0);
          return hospitalDate <= current;
        } catch (error) {
          logger.error(`Error parsing date during map update for hospital ${hospital.id}:`, error);
          return false;
        }
      });

      // Sort hospitals by status for consistent rendering
      const finalHospitalsToShow = [...dateFiltered].sort((a, b) => {
        if (a.status === 'Deployed' && b.status !== 'Deployed') return 1;
        if (a.status !== 'Deployed' && b.status === 'Deployed') return -1;
        return 0;
      });

      // Update the GeoJSON source
      const features = finalHospitalsToShow.map(hospital => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: hospital.coordinates ?? [0, 0],
        },
        properties: {
          id: hospital.id,
          name: hospital.name,
          status: hospital.status,
          isActive: hospital.deploymentDate === currentDate && timelineIndex < timelineLength - 1,
        },
      }));

      source.setData({
        type: 'FeatureCollection',
        features: features,
      });
    } catch (error) {
      logger.error('Error updating hospitals source data:', error);
    }
  }, [filteredHospitals, currentDate, mapLoaded, timelineIndex, timelineLength, mapRef]);
};

export const useHospitalInteractions = ({
  mapRef,
  mapLoaded,
  filteredHospitals,
  selectHospital,
  i18n,
  mapboxgl,
}: Pick<HospitalMarkersProps, 'mapRef' | 'mapLoaded' | 'filteredHospitals' | 'selectHospital' | 'i18n'> & { mapboxgl: any }) => {
  const popupRef = useRef<any>(null);

  // Add click handler for hospital points
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const clickHandler = (e: any) => {
      if (!e.features?.length || !mapRef.current) return;

      const feature = e.features[0];
      if (!feature) return;

      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const hospital = filteredHospitals.find(h => h.id === feature.properties?.id);

      if (hospital) {
        // Handle popup creation and display
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }

        const popupNode = document.createElement('div');
        const root = createRoot(popupNode);
        root.render(
          <I18nProvider i18n={i18n}>
            <HospitalDetail hospital={hospital} />
          </I18nProvider>
        );

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true,
          maxWidth: '300px',
          className: 'hospital-popup',
          offset: [0, 0],
        })
          .setLngLat(coordinates)
          .setDOMContent(popupNode)
          .addTo(mapRef.current);

        popupRef.current = popup;
        selectHospital(hospital);

        popup.on('close', () => {
          popupRef.current = null;
          selectHospital(null);
        });
      }
    };

    // Add click handler
    mapRef.current.on('click', 'hospital-points', clickHandler);

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', 'hospital-points', clickHandler);
      }
    };
  }, [mapLoaded, filteredHospitals, selectHospital, i18n, mapRef, mapboxgl]);

  const cleanup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, []);

  return {
    cleanup,
  };
};

// Combined hook for hospital markers functionality
export const useHospitalMarkersComplete = (props: HospitalMarkersProps) => {
  useHospitalMarkers(props);
  
  const interactions = useHospitalInteractions({
    mapRef: props.mapRef,
    mapLoaded: props.mapLoaded,
    filteredHospitals: props.filteredHospitals,
    selectHospital: props.selectHospital,
    i18n: props.i18n,
    mapboxgl: props.mapboxgl,
  });

  return interactions;
};

export default useHospitalMarkersComplete;
