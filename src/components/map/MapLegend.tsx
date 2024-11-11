import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { HOSPITAL_STATUS } from '@/utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const MapLegend: React.FC = () => {
  const { t } = useTranslation();
  const isVisible = useAppSelector(state => state.ui.isLegendVisible);
  const statuses = Object.values(HOSPITAL_STATUS);
  
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
      >
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('map.legend.title')}
          </h3>
          
          {statuses.map(status => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className={`w-4 h-4 rounded-full ${
                  status === 'Deployed' ? 'bg-green-500' :
                  status === 'In Progress' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t(`status.${status.toLowerCase()}`)}
              </span>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                5+
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('map.legend.cluster')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(MapLegend);