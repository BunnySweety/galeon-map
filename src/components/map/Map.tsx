import React, { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { mapService } from '@/services/mapService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMapInstance, setMapError, setMapLoading } from '@/store/slices/mapSlice';
import { selectFilteredHospitals } from '@/store/selectors/hospitalSelectors';
import { errorService } from '@/services/errorService';
import { performanceService } from '@/services/performanceService';
import { useTheme } from '@/hooks/useTheme';
import MapLoading from './MapLoading';

const Map: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const filteredHospitals = useAppSelector(selectFilteredHospitals);
    const isLoading = useAppSelector(state => state.map.isLoading);
    const { isDarkMode } = useTheme();

    const initializeMap = useCallback(async () => {
        if (!mapContainerRef.current) return;

        dispatch(setMapLoading(true));
        performanceService.startMeasure('mapInitialization');

        try {
            const map = await mapService.initializeMap(mapContainerRef.current.id);
            dispatch(setMapInstance(map));

            // Configure event listeners
            map.on('moveend', () => {
                performanceService.measureMapOperation('moveend', () => {
                    const bounds = map.getBounds();
                    dispatch(setBounds({
                        north: bounds.getNorth(),
                        south: bounds.getSouth(),
                        east: bounds.getEast(),
                        west: bounds.getWest()
                    }));
                });
            });

            map.on('zoomend', () => {
                performanceService.measureMapOperation('zoomend', () => {
                    dispatch(setZoom(map.getZoom()));
                });
            });

        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to initialize map');
            errorService.handleError(err, 'Map Initialization');
            dispatch(setMapError(err.message));
        } finally {
            dispatch(setMapLoading(false));
            performanceService.endMeasure('mapInitialization');
        }
    }, [dispatch]);

    // Map initialization
    useEffect(() => {
        initializeMap();

        return () => {
            performanceService.startMeasure('mapCleanup');
            mapService.destroy();
            performanceService.endMeasure('mapCleanup');
        };
    }, [initializeMap]);

    // Update markers
    useEffect(() => {
        performanceService.measureAsyncOperation('updateMarkers', async () => {
            try {
                await mapService.updateMarkers(filteredHospitals);
            } catch (error) {
                errorService.handleError(error as Error, 'Update Markers');
            }
        });
    }, [filteredHospitals]);

    // Dark/Light theme management
    useEffect(() => {
        performanceService.measureMapOperation('updateTheme', () => {
            mapService.updateTheme(isDarkMode);
        });
    }, [isDarkMode]);

    return (
        <div className="relative w-full h-full">
            {isLoading && <MapLoading />}
            
            <div 
                ref={mapContainerRef}
                id="map"
                className="w-full h-full"
                role="application"
                aria-label={t('map.ariaLabel')}
            />

            {/* Error message */}
            {mapError && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        {mapError}
                    </div>
                </div>
            )}
            
            {/* No results message */}
            {!isLoading && filteredHospitals.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <p className="text-gray-600 dark:text-gray-300">
                            {t('map.noResults')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(Map);