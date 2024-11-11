import L from 'leaflet';
import 'leaflet.markercluster';
import { Hospital } from '@/types/hospital';
import { MAP_CONFIG } from '@/utils/constants';
import { errorService } from '@/services/errorService';
import { performanceService } from '@/services/performanceService';
import { analytics } from '@/services/analyticsService';

class MapService {
  private map: L.Map | null = null;
  private markerClusterGroup: L.MarkerClusterGroup | null = null;
  private markers: Map<string, L.CircleMarker> = new Map();
  private currentTileLayer: L.TileLayer | null = null;

  async initializeMap(elementId: string): Promise<L.Map> {
    performanceService.startMeasure('mapInitialization');

    try {
      // Validation
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Map container element with id "${elementId}" not found`);
      }

      // Création de la carte
      this.map = L.map(elementId, {
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        zoomControl: false
      });

      // Ajout du tile layer
      this.currentTileLayer = L.tileLayer(MAP_CONFIG.tileLayer.url, {
        attribution: MAP_CONFIG.tileLayer.attribution,
        maxZoom: MAP_CONFIG.maxZoom
      });
      this.currentTileLayer.addTo(this.map);

      // Initialisation du cluster
      this.markerClusterGroup = L.markerClusterGroup({
        ...MAP_CONFIG.cluster,
        chunkedLoading: true,
        chunkInterval: 200,
        chunkDelay: 50
      });

      this.map.addLayer(this.markerClusterGroup);

      // Event listeners pour analytics
      this.map.on('zoomend', () => {
        analytics.trackMapInteraction('zoom', {
          level: this.map?.getZoom()
        });
      });

      this.map.on('moveend', () => {
        analytics.trackMapInteraction('pan', {
          center: this.map?.getCenter()
        });
      });

      return this.map;

    } catch (error) {
      errorService.handleError(error as Error, 'Map Initialization');
      throw error;
    } finally {
      performanceService.endMeasure('mapInitialization');
    }
  }

  async updateMarkers(hospitals: Hospital[]): Promise<void> {
    if (!this.map || !this.markerClusterGroup) {
      throw new Error('Map not initialized');
    }

    performanceService.startMeasure('updateMarkers');

    try {
      // Clear existing markers
      this.markerClusterGroup.clearLayers();
      this.markers.clear();

      // Process markers in chunks
      const chunkSize = 100;
      for (let i = 0; i < hospitals.length; i += chunkSize) {
        const chunk = hospitals.slice(i, i + chunkSize);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            const markers = chunk.map(hospital => this.createMarker(hospital));
            this.markerClusterGroup?.addLayers(markers.filter(Boolean) as L.CircleMarker[]);
            resolve();
          });
        });
      }

      // Adjust map view if needed
      if (hospitals.length > 0) {
        const bounds = L.latLngBounds(
          hospitals.map(h => [h.lat, h.lon] as L.LatLngExpression)
        );
        this.map.fitBounds(bounds, {
          padding: MAP_CONFIG.boundsPadding,
          maxZoom: MAP_CONFIG.maxZoom
        });
      }

    } catch (error) {
      errorService.handleError(error as Error, 'Update Markers');
      throw error;
    } finally {
      performanceService.endMeasure('updateMarkers');
    }
  }

  private createMarker(hospital: Hospital): L.CircleMarker | null {
    try {
      // Validation des données
      if (!this.isValidCoordinates(hospital.lat, hospital.lon)) {
        throw new Error(`Invalid coordinates for hospital ${hospital.id}`);
      }

      const marker = L.circleMarker(
        [hospital.lat, hospital.lon],
        {
          radius: MAP_CONFIG.marker.radius,
          fillColor: this.getStatusColor(hospital.status),
          color: '#ffffff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }
      );

      // Sanitize content for XSS prevention
      const popupContent = this.createSafePopupContent(hospital);
      marker.bindPopup(popupContent);

      // Tooltip
      marker.bindTooltip(this.sanitizeString(hospital.name), {
        direction: 'top',
        offset: [0, -10]
      });

      // Events
      marker.on('click', () => {
        analytics.trackMapInteraction('marker_click', { hospitalId: hospital.id });
      });

      this.markers.set(hospital.id, marker);
      return marker;

    } catch (error) {
      errorService.handleError(error as Error, 'Create Marker');
      return null;
    }
  }

  updateTheme(isDarkMode: boolean): void {
    if (!this.map) return;

    try {
      if (this.currentTileLayer) {
        this.map.removeLayer(this.currentTileLayer);
      }

      this.currentTileLayer = L.tileLayer(
        isDarkMode ? MAP_CONFIG.tileLayer.dark : MAP_CONFIG.tileLayer.url,
        {
          attribution: MAP_CONFIG.tileLayer.attribution,
          maxZoom: MAP_CONFIG.maxZoom
        }
      ).addTo(this.map);
    } catch (error) {
      errorService.handleError(error as Error, 'Update Theme');
    }
  }

  destroy(): void {
    performanceService.startMeasure('mapDestroy');
    try {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      this.markerClusterGroup = null;
      this.markers.clear();
      this.currentTileLayer = null;
    } catch (error) {
      errorService.handleError(error as Error, 'Map Destroy');
    } finally {
      performanceService.endMeasure('mapDestroy');
    }
  }

  // Utility methods
  private isValidCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  private sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .trim();
  }

  private createSafePopupContent(hospital: Hospital): HTMLElement {
    const container = document.createElement('div');
    container.className = 'hospital-popup';
    
    const content = `
      <h3 class="font-semibold text-lg">${this.sanitizeString(hospital.name)}</h3>
      <p class="text-gray-600 dark:text-gray-400">${this.sanitizeString(hospital.address)}</p>
      ${hospital.website ? `
        <a href="${encodeURI(hospital.website)}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="text-blue-600 hover:underline mt-2 inline-block">
          Visit Website
        </a>
      ` : ''}
      <div class="mt-2">
        <span class="status-badge ${hospital.status.toLowerCase()}">
          ${hospital.status}
        </span>
      </div>
    `;

    container.innerHTML = content;

    // Add event listeners if needed
    const link = container.querySelector('a');
    if (link) {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
        analytics.trackMapInteraction('website_click', { hospitalId: hospital.id });
      });
    }

    return container;
  }

  private getStatusColor(status: string): string {
    return MAP_CONFIG.marker.colors[status.toLowerCase()] || MAP_CONFIG.marker.colors.default;
  }
}

export const mapService = new MapService();
export default mapService;