import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ZoomIn, ZoomOut, Layers, Navigation2, Maximize2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMapZoom } from '@/store/slices/mapSlice';
import { mapService } from '@/services/mapService';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

interface MapControlProps {
  onSearchClick?: () => void;
}

const MapControls: React.FC<MapControlProps> = ({ onSearchClick }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentZoom = useAppSelector(state => state.map.zoom);

  const handleZoomIn = () => {
    const map = mapService.getMap();
    if (map) {
      map.setZoom(currentZoom + 1);
      dispatch(setMapZoom(currentZoom + 1));
    }
  };

  const handleZoomOut = () => {
    const map = mapService.getMap();
    if (map) {
      map.setZoom(currentZoom - 1);
      dispatch(setMapZoom(currentZoom - 1));
    }
  };

  const handleLocate = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const map = mapService.getMap();
      if (map) {
        map.setView(
          [position.coords.latitude, position.coords.longitude],
          12
        );
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleFullscreen = () => {
    const map = document.getElementById('map');
    if (map) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        map.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed top-4 left-4 z-10 flex flex-col gap-2">
      <Tooltip content={t('map.controls.search')}>
        <Button
          variant="secondary"
          size="icon"
          onClick={onSearchClick}
          className="rounded-full"
        >
          <Search className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content={t('map.controls.zoomIn')}>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          disabled={currentZoom >= 18}
          className="rounded-full"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content={t('map.controls.zoomOut')}>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          disabled={currentZoom <= 3}
          className="rounded-full"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content={t('map.controls.layers')}>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => mapService.toggleClusterLayer()}
          className="rounded-full"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content={t('map.controls.locate')}>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleLocate}
          className="rounded-full"
        >
          <Navigation2 className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content={t('map.controls.fullscreen')}>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleFullscreen}
          className="rounded-full"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default React.memo(MapControls);