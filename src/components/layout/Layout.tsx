import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Sidebar from './Sidebar';
import Map from '@/components/map/Map';
import MapControls from '@/components/map/MapControls';
import MapLegend from '@/components/map/MapLegend';
import Statistics from '@/components/statistics/Statistics';
import { Toaster } from '@/components/ui/Toaster';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useAppSelector } from '@/store/hooks';
import { selectIsLoading } from '@/store/selectors/uiSelectors';
import { performanceService } from '@/services/performanceService';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const isLoading = useAppSelector(selectIsLoading);

  // Enable keyboard shortcuts
  useKeyboard({
    enableEscapeKey: true,
    enableSearchShortcut: true
  });

  useEffect(() => {
    // Start performance monitoring
    performanceService.startMeasure('pageLoad');

    // Update document metadata
    document.title = t('app.name');
    document.documentElement.lang = t('language');
    document.documentElement.dir = ['ar', 'fa', 'ur'].includes(t('language')) ? 'rtl' : 'ltr';

    // Toggle dark mode class
    document.documentElement.classList.toggle('dark', isDarkMode);

    return () => {
      performanceService.endMeasure('pageLoad');
    };
  }, [t, isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="relative flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Map Container */}
        <div className="relative flex-1 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('loading')}
                </span>
              </div>
            </div>
          )}

          {/* Map */}
          <Map />
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10">
            <MapControls />
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-10">
            <MapLegend />
          </div>

          {/* Statistics */}
          <div className="absolute bottom-4 right-4 z-10">
            <Statistics />
          </div>

          {/* Additional Content */}
          {children}
        </div>
      </main>

      {/* Footer Content */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="container mx-auto px-4 py-2 flex justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Made with <span className="text-red-500">♥</span> by BunnySweety © {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* Notifications */}
      <Toaster />

      {/* Network Status */}
      <div
        className={`
          fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
          transition-all duration-300
          ${navigator.onLine ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        `}
      >
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg">
          {t('notifications.offline')}
        </div>
      </div>

      {/* PWA Install Prompt */}
      <div id="pwa-install-prompt" className="hidden">
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50">
          <h3 className="text-lg font-semibold mb-2">{t('pwa.installTitle')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {t('pwa.installDescription')}
          </p>
          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {t('buttons.notNow')}
            </button>
            <button className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark">
              {t('buttons.install')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;