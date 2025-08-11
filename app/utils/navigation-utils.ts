/**
 * Navigation utilities for opening directions to hospitals
 */
import logger from './logger';

export interface NavigationOptions {
  address?: string;
  coordinates?: [number, number];
  hospitalName?: string;
}

/**
 * Opens directions to a location using the user's preferred map application
 * Supports Google Maps, Apple Maps, and fallback to web-based maps
 */
export function openDirections(options: NavigationOptions): void {
  const { address, coordinates } = options;

  // Determine the best query parameter for the destination
  let destination = '';

  if (coordinates) {
    // Use coordinates for most accurate location
    destination = `${coordinates[1]},${coordinates[0]}`;
  } else if (address) {
    // Fallback to address
    destination = encodeURIComponent(address);
  } else {
    logger.error('No destination provided for navigation');
    return;
  }

  // Detect user's platform and open appropriate map app
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  try {
    if (isIOS) {
      // Try Apple Maps first on iOS
      const appleMapsUrl = `maps://maps.apple.com/?daddr=${destination}&dirflg=d`;
      window.open(appleMapsUrl, '_blank');

      // Fallback to Google Maps if Apple Maps doesn't open
      setTimeout(() => {
        const googleMapsUrl = `https://maps.google.com/maps?daddr=${destination}&dirflg=d`;
        window.open(googleMapsUrl, '_blank');
      }, 1000);
    } else if (isAndroid) {
      // Use Google Maps intent on Android
      const googleMapsIntent = `intent://maps.google.com/maps?daddr=${destination}&dirflg=d#Intent;scheme=https;package=com.google.android.apps.maps;end`;
      window.location.href = googleMapsIntent;

      // Fallback to web version
      setTimeout(() => {
        const googleMapsUrl = `https://maps.google.com/maps?daddr=${destination}&dirflg=d`;
        window.open(googleMapsUrl, '_blank');
      }, 1000);
    } else {
      // Desktop: Open Google Maps in new tab
      const googleMapsUrl = `https://maps.google.com/maps?daddr=${destination}&dirflg=d`;
      window.open(googleMapsUrl, '_blank');
    }
  } catch (error) {
    logger.error('Error opening navigation:', error);
    // Ultimate fallback: Google Maps web
    const googleMapsUrl = `https://maps.google.com/maps?daddr=${destination}&dirflg=d`;
    window.open(googleMapsUrl, '_blank');
  }
}

/**
 * Creates a modern modal for selecting map applications
 */
export function createMapSelectionModal(options: NavigationOptions): Promise<void> {
  return new Promise(resolve => {
    const { address, coordinates, hospitalName } = options;

    let destination = '';
    if (coordinates) {
      destination = `${coordinates[1]},${coordinates[0]}`;
    } else if (address) {
      destination = encodeURIComponent(address);
    } else {
      logger.error('No destination provided for navigation');
      resolve();
      return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className =
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4';
    overlay.style.backdropFilter = 'blur(4px)';

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl max-w-md w-full p-6';
    modal.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Choisir l'application de navigation</h3>
        <button class="close-modal text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <p class="text-sm text-gray-600 mb-6">
        Sélectionnez votre application préférée pour obtenir l'itinéraire vers ${hospitalName ?? 'cet hôpital'} :
      </p>

      <div class="space-y-3">
        <button class="map-option w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-service="google">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span class="text-xl">🗺️</span>
          </div>
          <div class="text-left">
            <div class="font-medium text-gray-900">Google Maps</div>
            <div class="text-sm text-gray-500">Navigation web universelle</div>
          </div>
        </button>

        ${
          /iphone|ipad|ipod|mac/.test(navigator.userAgent.toLowerCase())
            ? `
        <button class="map-option w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-service="apple">
          <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <span class="text-xl">🍎</span>
          </div>
          <div class="text-left">
            <div class="font-medium text-gray-900">Apple Maps</div>
            <div class="text-sm text-gray-500">Application native Apple</div>
          </div>
        </button>
        `
            : ''
        }

        <button class="map-option w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-service="waze">
          <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span class="text-xl">🚗</span>
          </div>
          <div class="text-left">
            <div class="font-medium text-gray-900">Waze</div>
            <div class="text-sm text-gray-500">Navigation communautaire</div>
          </div>
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Handle clicks
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.closest('.close-modal') || target === overlay) {
        // Close modal
        document.body.removeChild(overlay);
        resolve();
        return;
      }

      const mapOption = target.closest('.map-option') as HTMLElement;
      if (mapOption) {
        const service = mapOption.dataset.service;

        // Open the selected service
        switch (service) {
          case 'google':
            window.open(`https://maps.google.com/maps?daddr=${destination}&dirflg=d`, '_blank');
            break;
          case 'apple':
            window.open(`maps://maps.apple.com/?daddr=${destination}&dirflg=d`, '_blank');
            break;
          case 'waze':
            window.open(
              `https://waze.com/ul?ll=${coordinates ? `${coordinates[1]},${coordinates[0]}` : ''}&navigate=yes`,
              '_blank'
            );
            break;
        }

        // Close modal
        document.body.removeChild(overlay);
        resolve();
      }
    };

    overlay.addEventListener('click', handleClick);

    // Close on Escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleKeydown);
        resolve();
      }
    };

    document.addEventListener('keydown', handleKeydown);
  });
}

/**
 * Opens directions with multiple map service options
 * Shows a menu to let user choose their preferred map service
 */
export function openDirectionsWithOptions(options: NavigationOptions): void {
  const { address, coordinates, hospitalName } = options;

  let destination = '';
  if (coordinates) {
    destination = `${coordinates[1]},${coordinates[0]}`;
  } else if (address) {
    destination = encodeURIComponent(address);
  } else {
    logger.error('No destination provided for navigation');
    return;
  }

  // Create URLs for different map services
  const mapServices = [
    {
      name: 'Google Maps',
      url: `https://maps.google.com/maps?daddr=${destination}&dirflg=d`,
      icon: '🗺️',
    },
    {
      name: 'Apple Maps',
      url: `maps://maps.apple.com/?daddr=${destination}&dirflg=d`,
      icon: '🍎',
      condition: /iphone|ipad|ipod|mac/.test(navigator.userAgent.toLowerCase()),
    },
    {
      name: 'Waze',
      url: `https://waze.com/ul?ll=${coordinates ? `${coordinates[1]},${coordinates[0]}` : ''}&navigate=yes`,
      icon: '🚗',
    },
  ];

  // Filter services based on platform
  const availableServices = mapServices.filter(service => !service.condition || service.condition);

  // If only one service available, open it directly
  if (availableServices.length === 1 && availableServices[0]) {
    window.open(availableServices[0].url, '_blank');
    return;
  }

  // Create a simple selection dialog
  const serviceNames = availableServices
    .map((service, index) => `${index + 1}. ${service.icon} ${service.name}`)
    .join('\n');

  const choice = prompt(
    `Choisissez votre application de navigation pour aller à ${hospitalName ?? 'cet hôpital'} :\n\n${serviceNames}\n\nEntrez le numéro de votre choix (ou appuyez sur Annuler pour Google Maps par défaut):`
  );

  if (choice === null) {
    // User cancelled, open Google Maps as default
    if (availableServices[0]) {
      window.open(availableServices[0].url, '_blank');
    }
    return;
  }

  const choiceIndex = parseInt(choice) - 1;
  if (
    choiceIndex >= 0 &&
    choiceIndex < availableServices.length &&
    availableServices[choiceIndex]
  ) {
    window.open(availableServices[choiceIndex].url, '_blank');
  } else {
    // Invalid choice, open Google Maps as default
    if (availableServices[0]) {
      window.open(availableServices[0].url, '_blank');
    }
  }
}

/**
 * Simple function to open Google Maps directions (most compatible)
 */
export function openGoogleMapsDirections(options: NavigationOptions): void {
  const { address, coordinates } = options;

  let destination = '';
  if (coordinates) {
    destination = `${coordinates[1]},${coordinates[0]}`;
  } else if (address) {
    destination = encodeURIComponent(address);
  } else {
    logger.error('No destination provided for navigation');
    return;
  }

  const googleMapsUrl = `https://maps.google.com/maps?daddr=${destination}&dirflg=d`;
  window.open(googleMapsUrl, '_blank');
}
