'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLingui } from '@lingui/react';
import { NavigationOptions } from '../utils/navigation-utils';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: NavigationOptions;
}

interface MapService {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  condition?: boolean;
}

const NavigationModal: React.FC<NavigationModalProps> = ({ isOpen, onClose, options }) => {
  const { i18n } = useLingui();
  const [destination, setDestination] = useState('');

  // Create a safe translation function
  const _ = (text: string) => {
    try {
      return i18n?._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  };

  useEffect(() => {
    if (options.coordinates) {
      setDestination(`${options.coordinates[1]},${options.coordinates[0]}`);
    } else if (options.address) {
      setDestination(encodeURIComponent(options.address));
    }
  }, [options]);

  const mapServices: MapService[] = [
    {
      id: 'google',
      name: 'Google Maps',
      description: _('Universal web navigation'),
      icon: '🗺️',
      url: `https://maps.google.com/maps?daddr=${destination}&dirflg=d`,
      condition: true,
    },
    {
      id: 'apple',
      name: 'Apple Maps',
      description: _('Native Apple application'),
      icon: '🍎',
      url: `maps://maps.apple.com/?daddr=${destination}&dirflg=d`,
      condition: /iphone|ipad|ipod|mac/.test(navigator.userAgent.toLowerCase()),
    },
    {
      id: 'waze',
      name: 'Waze',
      description: _('Community navigation'),
      icon: '🚗',
      url: `https://waze.com/ul?ll=${options.coordinates ? `${options.coordinates[1]},${options.coordinates[0]}` : ''}&navigate=yes`,
      condition: true,
    },
  ];

  const availableServices = mapServices.filter(service => service.condition);

  const handleServiceClick = useCallback(
    (service: MapService) => {
      window.open(service.url, '_blank');
      onClose();
    },
    [onClose]
  );

  // Factory pour créer un handler de service optimisé
  const createServiceClickHandler = useCallback(
    (service: MapService) => {
      return () => handleServiceClick(service);
    },
    [handleServiceClick]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{_('Choose navigation app')}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label={_('Close')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          {_('Select your preferred app to get directions to')}{' '}
          {options.hospitalName ?? _('this hospital')}:
        </p>

        {/* Service options */}
        <div className="space-y-3">
          {availableServices.map(service => (
            <button
              key={service.id}
              onClick={createServiceClickHandler(service)}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  service.id === 'google'
                    ? 'bg-blue-100'
                    : service.id === 'apple'
                      ? 'bg-gray-100'
                      : 'bg-purple-100'
                }`}
              >
                <span className="text-xl">{service.icon}</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">{service.name}</div>
                <div className="text-sm text-gray-500">{service.description}</div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          {_('Your default browser will open the selected navigation app')}
        </p>
      </div>
    </div>
  );
};

export default NavigationModal;
