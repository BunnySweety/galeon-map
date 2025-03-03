'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useHospitalQuery } from '../../store/useQueryHooks';
import { Hospital } from '../../store/useMapStore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Setup MapBox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2s1bnRnMGRoMDBucjNtcDM3cGpqeTJpZyJ9.1vY8E3wImZevWe4p1LiLCQ';

interface HospitalDetailClientProps {
  hospitalId: string;
}

export default function HospitalDetailClient({ hospitalId }: HospitalDetailClientProps) {
  const { i18n } = useLingui();
  
  // Create a safe translation function that handles undefined i18n
  const _ = (text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  };
  
  const router = useRouter();
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  
  // Fetch hospital data
  const { data: hospital, isLoading, error } = useHospitalQuery(hospitalId);
  
  // État pour stocker les détails de l'hôpital typés
  const [hospitalDetails, setHospitalDetails] = useState<Hospital | null>(null);
  
  // Mettre à jour les détails de l'hôpital quand les données sont chargées
  useEffect(() => {
    if (hospital) {
      setHospitalDetails(hospital as Hospital);
    }
  }, [hospital]);

  // Utiliser l'état hospitalDetails dans un effet
  useEffect(() => {
    if (hospitalDetails) {
      // Afficher le titre de la page avec le nom de l'hôpital
      document.title = `Galeon - ${hospitalDetails.name}`;
      
      // Logger les détails
      console.log(`Hospital status: ${hospitalDetails.status}`);
      console.log(`Deployed on: ${hospitalDetails.deploymentDate}`);
    }
  }, [hospitalDetails]);

  // Initialize map when hospital data is loaded
  useEffect(() => {
    if (!hospitalDetails) return;
    
    const mapContainer = document.getElementById('detail-map');
    if (!mapContainer || mapInstance) return;
    
    const map = new mapboxgl.Map({
      container: 'detail-map',
      style: 'mapbox://styles/mapbox/light-v11',
      center: hospitalDetails.coordinates,
      zoom: 13,
      attributionControl: false,
    });
    
    map.on('load', () => {
      // Add marker for the hospital
      const markerEl = document.createElement('div');
      markerEl.className = 'hospital-marker';
      markerEl.style.width = '30px';
      markerEl.style.height = '30px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.backgroundColor = hospitalDetails.status === 'Deployed' ? '#36A2EB' : '#4BC0C0';
      markerEl.style.border = '3px solid white';
      markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      new mapboxgl.Marker(markerEl)
        .setLngLat(hospitalDetails.coordinates)
        .addTo(map);
      
      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add fullscreen control
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    });
    
    setMapInstance(map);
    
    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [hospitalDetails, mapInstance]);

  // Handle back button
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !hospitalDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">
          <h2 className="text-lg font-semibold mb-2">{_('Error')}</h2>
          <p>{error instanceof Error ? error.message : _('Hospital not found')}</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {_('Go back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">Ω</span>
            <span className="text-lg font-bold">{_('GALEON')}</span>
          </div>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            {_('Back to map')}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Cover image */}
          <div className="h-64 bg-blue-100 relative" style={{ height: '256px' }}>
            <Image 
              src={hospitalDetails.imageUrl} 
              alt={hospitalDetails.name} 
              fill
              sizes="100%"
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h1 className="text-3xl font-bold text-white">{hospitalDetails.name}</h1>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                  ${hospitalDetails.status === 'Deployed' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                  {_(hospitalDetails.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Hospital details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key details */}
              <div>
                <h2 className="text-xl font-semibold mb-4">{_('Hospital Details')}</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{_('Status')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{_(hospitalDetails.status)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{_('Deployment Date')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{format(new Date(hospitalDetails.deploymentDate), 'PPP')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{_('Address')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{hospitalDetails.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{_('Website')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a 
                        href={hospitalDetails.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {hospitalDetails.website}
                      </a>
                    </dd>
                  </div>
                </dl>
                
                {/* Action buttons */}
                <div className="mt-6 flex space-x-3">
                  <a 
                    href={hospitalDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
                  >
                    {_('Visit Website')}
                  </a>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${hospitalDetails.coordinates[1]},${hospitalDetails.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center"
                  >
                    {_('Get Directions')}
                  </a>
                </div>
              </div>
              
              {/* Map */}
              <div>
                <h2 className="text-xl font-semibold mb-4">{_('Location')}</h2>
                <div id="detail-map" className="h-64 rounded-lg border border-gray-200"></div>
                <p className="mt-2 text-sm text-gray-500">
                  {_('Coordinates')}: {hospitalDetails.coordinates[1]}, {hospitalDetails.coordinates[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional information (placeholder) */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{_('About This Hospital')}</h2>
          <p className="text-gray-700">
            {_('This is a placeholder for additional information about the hospital. In a production environment, this section would contain detailed information about the hospital, its services, departments, and other relevant information.')}
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 text-white p-6 mt-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold mr-2">Ω</span>
                <span className="text-lg font-bold">GALEON</span>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                {_('A community-driven map of deployed hospitals, with support from the Galeon team. Data is not official and may evolve over time.')}
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <h3 className="text-sm font-semibold mb-2">{_('Connect with us')}</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.03 10.03 0 01-3.127 1.184A4.92 4.92 0 0012.32 8.58a13.94 13.94 0 01-10.121-5.13 4.92 4.92 0 001.526 6.57 4.9 4.9 0 01-2.23-.618v.063a4.92 4.92 0 003.946 4.827 4.924 4.924 0 01-2.224.085 4.93 4.93 0 004.6 3.42A9.873 9.873 0 010 19.54a13.9 13.9 0 007.548 2.208c9.054 0 14-7.5 14-14 0-.21-.005-.42-.014-.63A10.012 10.012 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
            <p>© 2025 Galeon Community - <a href="#" className="text-blue-400 hover:underline">{_('Open source project')}</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
} 