import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
import { useAppSelector } from '@/store/hooks';
import { selectFilteredHospitals } from '@/store/selectors/hospitalSelectors';
import { MAP_CONFIG } from '@/utils/constants';
import { performanceService } from '@/services/performanceService';
import { analytics } from '@/services/analyticsService';

const MarkerCluster: React.FC = () => {
  const map = useMap();
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const hospitals = useAppSelector(selectFilteredHospitals);

  useEffect(() => {
    if (!map) return;

    performanceService.startMeasure('clusterInitialization');

    // Initialize marker cluster group
    markerClusterRef.current = L.markerClusterGroup({
      maxClusterRadius: MAP_CONFIG.cluster.maxClusterRadius,
      spiderfyOnMaxZoom: MAP_CONFIG.cluster.spiderfyOnMaxZoom,
      showCoverageOnHover: MAP_CONFIG.cluster.showCoverageOnHover,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
      chunkInterval: MAP_CONFIG.cluster.chunkInterval,
      chunkDelay: MAP_CONFIG.cluster.chunkDelay,
      animateAddingMarkers: true,
      
      // Custom icon creation
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';

        if (count > 100) {
          size = 'large';
        } else if (count > 10) {
          size = 'medium';
        }

        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40)
        });
      }
    });

    // Add event listeners
    markerClusterRef.current
      .on('clusterclick', (e) => {
        const cluster = e.layer;
        const markers = cluster.getAllChildMarkers();
        analytics.trackEvent('Map', 'cluster_click', `size_${markers.length}`);
      })
      .on('clustermouseover', (e) => {
        const cluster = e.layer;
        cluster.spiderfy();
      })
      .on('animationend', () => {
        performanceService.endMeasure('clusterAnimation');
      });

    // Add cluster layer to map
    map.addLayer(markerClusterRef.current);
    performanceService.endMeasure('clusterInitialization');

    return () => {
      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current);
      }
    };
  }, [map]);

  // Update markers when hospitals change
  useEffect(() => {
    if (!markerClusterRef.current) return;

    performanceService.startMeasure('updateClusters');

    markerClusterRef.current.clearLayers();

    // Process markers in chunks
    const chunkSize = MAP_CONFIG.cluster.chunkSize;
    const chunks = Array.from({ length: Math.ceil(hospitals.length / chunkSize) }, (_, i) =>
      hospitals.slice(i * chunkSize, (i + 1) * chunkSize)
    );

    let chunkIndex = 0;
    const processChunk = () => {
      if (chunkIndex >= chunks.length || !markerClusterRef.current) return;

      const chunk = chunks[chunkIndex];
      const markers = chunk.map(hospital => {
        const marker = L.circleMarker([hospital.lat, hospital.lon], {
          radius: MAP_CONFIG.marker.radius,
          fillColor: MAP_CONFIG.marker.colors[hospital.status.toLowerCase()] || MAP_CONFIG.marker.colors.default,
          color: '#ffffff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });

        // Add hospital data to marker
        marker.hospital = hospital;
        
        return marker;
      });

      markerClusterRef.current.addLayers(markers);
      chunkIndex++;

      if (chunkIndex < chunks.length) {
        setTimeout(processChunk, MAP_CONFIG.cluster.chunkDelay);
      } else {
        performanceService.endMeasure('updateClusters');
      }
    };

    processChunk();
  }, [hospitals]);

  return null;
};

export default React.memo(MarkerCluster);