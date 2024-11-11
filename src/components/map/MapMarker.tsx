import React, { useEffect, useCallback } from 'react';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedHospital } from '@/store/slices/uiSlice';
import { Hospital } from '@/types/hospital';
import { MAP_CONFIG } from '@/utils/constants';
import { analytics } from '@/services/analyticsService';

interface MapMarkerProps {
  hospital: Hospital;
  isHighlighted?: boolean;
}

const MapMarker: React.FC<MapMarkerProps> = ({ hospital, isHighlighted }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const getMarkerStyle = useCallback(() => {
    const baseStyle = {
      radius: MAP_CONFIG.marker.radius,
      fillColor: MAP_CONFIG.marker.colors[hospital.status.toLowerCase()] || MAP_CONFIG.marker.colors.default,
      color: '#ffffff',
      weight: isHighlighted ? 2 : 1,
      opacity: 1,
      fillOpacity: isHighlighted ? 0.9 : 0.8
    };

    if (isHighlighted) {
      return {
        ...baseStyle,
        radius: MAP_CONFIG.marker.radius * 1.2,
        weight: 2,
        className: 'marker-pulse'
      };
    }

    return baseStyle;
  }, [hospital.status, isHighlighted]);

  const handleMarkerClick = useCallback(() => {
    dispatch(setSelectedHospital(hospital.id));
    analytics.trackEvent('Map', 'marker_click', hospital.id);
  }, [dispatch, hospital.id]);

  useEffect(() => {
    if (isHighlighted) {
      analytics.trackEvent('Map', 'marker_highlight', hospital.id);
    }
  }, [isHighlighted, hospital.id]);

  return (
    <CircleMarker
      center={[hospital.lat, hospital.lon]}
      {...getMarkerStyle()}
      eventHandlers={{
        click: handleMarkerClick,
        mouseover: () => {
          analytics.trackEvent('Map', 'marker_hover', hospital.id);
        }
      }}
    >
      <Tooltip 
        direction="top" 
        offset={[0, -10]}
        opacity={0.9}
      >
        <div className="text-sm font-medium">
          {hospital.name}
        </div>
      </Tooltip>

      <Popup
        closeButton={false}
        maxWidth={300}
        className="hospital-popup"
      >
        <div className="p-2">
          <h3 className="font-semibold text-lg mb-2">{hospital.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {hospital.address}
          </p>
          {hospital.website && (
            <a
              href={hospital.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm inline-block mb-2"
            >
              {t('hospital.visitWebsite')}
            </a>
          )}
          <div className="mt-2">
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${hospital.status === 'Deployed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                hospital.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'}
            `}>
              {t(`hospital.status.${hospital.status.toLowerCase()}`)}
            </span>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
};

export default React.memo(MapMarker);