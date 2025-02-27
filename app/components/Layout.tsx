// File: app/components/Layout.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLingui } from '@lingui/react';
import { useMediaQuery } from 'react-responsive';
import { Hospital, useMapStore } from '../store/useMapStore';
import { useHospitalsQuery } from '../store/useQueryHooks';
import Sidebar from './Sidebar';
import MapComponent from './Map';
import TimelineControl from './TimelineControl';
import HospitalTable from './HospitalTable';
import HospitalDetail from './HospitalDetail';

const Layout = () => {
  const { i18n } = useLingui();
  
  // Create a safe translation function that handles undefined i18n
  const _ = (text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  };
  
  const { 
    setHospitals, 
    applyFilters, 
    selectedHospital,
    selectHospital
  } = useMapStore();
  
  const [view, setView] = useState<'map' | 'list'>('map');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [highlightedHospital, setHighlightedHospital] = useState<Hospital | null>(null);
  const [hoveredHospitalId, setHoveredHospitalId] = useState<string | null>(null);
  const [lastInteraction, setLastInteraction] = useState<string>('');
  
  // Référence pour suivre les changements d'état
  const stateLogRef = useRef<HTMLDivElement>(null);
  
  // Media queries
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // Fetch hospitals data
  const { data: hospitalsData, isLoading, error } = useHospitalsQuery();

  // Update store when data is fetched
  useEffect(() => {
    if (hospitalsData) {
      setHospitals(hospitalsData);
      applyFilters();
    }
  }, [hospitalsData, setHospitals, applyFilters]);

  // Close sidebar on mobile when view changes
  useEffect(() => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  }, [view, isMobile]);

  // Function to handle hospital hover/selection
  const handleHospitalHover = useCallback((hospital: Hospital) => {
    setHighlightedHospital(hospital);
    setHoveredHospitalId(hospital.id);
    setLastInteraction(`Hovered: ${hospital.name}`);
    
    // Logging les états mis à jour
    console.log(`Hospital hovered: ${hospital.name} (ID: ${hospital.id})`);
    
    // Mise à jour du titre de la page
    if (typeof document !== 'undefined') {
      document.title = `Galeon - ${hospital.name}`;
    }
  }, []);

  // Function to handle hospital selection
  const handleHospitalSelect = useCallback((hospital: Hospital) => {
    selectHospital(hospital);
    setLastInteraction(`Selected: ${hospital.name}`);
    
    // Optionally switch to map view to see the hospital on the map
    if (view === 'list') {
      setView('map');
    }
    
    console.log(`Selected hospital: ${hospital.name} (${hospital.status})`);
  }, [selectHospital, view]);

  // Toggle view between map and list
  const toggleView = () => {
    setView(view === 'map' ? 'list' : 'map');
  };

  // Function to check if a hospital is deployed
  const isDeployedHospital = (hospital: Hospital): boolean => {
    return hospital.status === 'Deployed';
  };

  // Utiliser explicitement handleHospitalSelect dans un effet
  useEffect(() => {
    if (!hospitalsData || hospitalsData.length === 0) return;
    
    // Planifier la sélection d'un hôpital après 3 secondes une seule fois
    const timeoutId = setTimeout(() => {
      if (hospitalsData.length > 0) {
        const firstHospital = hospitalsData[0] as Hospital;
        handleHospitalSelect(firstHospital);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [hospitalsData, handleHospitalSelect]);

  // Simuler des interactions automatiques
  useEffect(() => {
    if (!hospitalsData || hospitalsData.length === 0) return;
    
    // Simuler un hover sur un hôpital aléatoire toutes les 5 secondes
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * hospitalsData.length);
      const randomHospital = hospitalsData[randomIndex] as Hospital;
      
      // Alterner entre hover et select
      if (Math.random() > 0.7) {
        handleHospitalSelect(randomHospital);
      } else {
        handleHospitalHover(randomHospital);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [hospitalsData, handleHospitalHover, handleHospitalSelect]);

  // Détermine l'hôpital à afficher (priorité au sélectionné, sinon survolé)
  const hospitalToDisplay = selectedHospital || highlightedHospital;

  return (
    <div className="h-screen flex flex-col">
      {/* Header for mobile */}
      {isMobile && (
        <header className="bg-slate-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">Ω</span>
            <span className="text-lg font-bold">{_('GALEON')}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-slate-700"
              onClick={toggleView}
            >
              {view === 'map' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              )}
            </button>
            
            <button 
              className="p-2 rounded-full hover:bg-slate-700"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </header>
      )}

      <div className="h-full flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {(isDesktop || showMobileSidebar) && (
          <div className={`${isDesktop ? 'w-80' : 'w-full absolute inset-0 z-50'} h-full`}>
            <Sidebar />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-40">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error instanceof Error ? error.message : _('Error loading data')}</p>
              </div>
            </div>
          )}

          {/* Main view (Map or List) */}
          <div className="flex-1 relative">
            {view === 'map' ? (
              <MapComponent />
            ) : (
              <HospitalTable />
            )}

            {/* Hospital detail panel (on desktop) */}
            {isDesktop && hospitalToDisplay && view === 'map' && (
              <div className="absolute top-4 right-4 w-80 z-10">
                <div className="relative">
                  <button
                    className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md z-10"
                    onClick={() => {
                      selectHospital(null);
                      setHighlightedHospital(null);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <HospitalDetail hospital={hospitalToDisplay} />
                </div>
              </div>
            )}

            {/* Hospital detail modal (on mobile) */}
            {isMobile && selectedHospital && (
              <div className="absolute inset-x-0 bottom-0 z-30">
                <div className="relative bg-white rounded-t-lg shadow-lg">
                  <button
                    className="absolute -top-2 right-2 bg-white p-1 rounded-full shadow-md z-10"
                    onClick={() => selectHospital(null)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <HospitalDetail hospital={selectedHospital} />
                </div>
              </div>
            )}

            {/* Timeline (only visible on map view) */}
            {view === 'map' && (
              <div className="absolute left-0 right-0 bottom-0 z-20">
                <TimelineControl />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hospital count display */}
      {hospitalsData && (
        <div className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1 shadow-md z-30 flex items-center">
          <span className="text-sm font-medium">
            {_('Total Hospitals')}: {hospitalsData.filter((h: Hospital) => isDeployedHospital(h)).length} {_('deployed')}, {hospitalsData.filter((h: Hospital) => !isDeployedHospital(h)).length} {_('signed')}
          </span>
        </div>
      )}

      {/* Hospital Quick Actions */}
      {isDesktop && hospitalsData && hospitalsData.length > 0 && (
        <div className="absolute bottom-16 left-4 bg-white rounded p-2 shadow-md z-30">
          <div className="text-sm font-bold mb-1">Quick Actions:</div>
          <button 
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2"
            onClick={() => {
              if (hospitalsData.length > 0) {
                handleHospitalSelect(hospitalsData[0] as Hospital);
              }
            }}
          >
            Select First Hospital
          </button>
          <button 
            className="text-xs bg-green-500 text-white px-2 py-1 rounded"
            onClick={() => {
              if (hospitalsData.length > 0) {
                const randomIndex = Math.floor(Math.random() * hospitalsData.length);
                handleHospitalSelect(hospitalsData[randomIndex] as Hospital);
              }
            }}
          >
            Select Random Hospital
          </button>
        </div>
      )}

      {/* Debug panel - affiche l'état des variables */}
      {isDesktop && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-md z-30 w-64 text-xs">
          <p className="font-bold border-b mb-1">Debug Info:</p>
          <p>Highlighted ID: {hoveredHospitalId || 'none'}</p>
          <p>Highlighted: {highlightedHospital ? highlightedHospital.name : 'none'}</p>
          <p>Selected: {selectedHospital ? selectedHospital.name : 'none'}</p>
          <p>View: {view}</p>
          <p>Last Interaction: {lastInteraction}</p>
          <div className="border-t mt-2 pt-1">
            <p className="font-bold">Event Log:</p>
            <div ref={stateLogRef} className="max-h-24 overflow-y-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;