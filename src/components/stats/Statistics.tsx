import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { selectHospitalStatistics } from '@/store/selectors/hospitalSelectors';
import { Gauge } from './Gauge';
import { StatsCard } from './StatsCard';
import { RegionChart } from './RegionChart';
import { motion } from 'framer-motion';

const Statistics: React.FC = () => {
  const { t } = useTranslation();
  const stats = useAppSelector(selectHospitalStatistics);
  const isDarkMode = useAppSelector(state => state.ui.darkMode);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className="fixed bottom-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-96"
    >
      <div className="space-y-4">
        {/* Total Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            title={t('stats.total')}
            value={stats.totalCount}
            trend={stats.trend}
          />
          <StatsCard
            title={t('stats.countries')}
            value={Object.keys(stats.byCountry).length}
          />
          <StatsCard
            title={t('stats.regions')}
            value={Object.keys(stats.byRegion).length}
          />
        </div>

        {/* Status Gauges */}
        <div className="grid grid-cols-3 gap-4">
          <Gauge
            value={(stats.deployedCount / stats.totalCount) * 100}
            label={t('status.deployed')}
            color={isDarkMode ? '#4CAF50' : '#4CAF50'}
          />
          <Gauge
            value={(stats.inProgressCount / stats.totalCount) * 100}
            label={t('status.inProgress')}
            color={isDarkMode ? '#FFA500' : '#FFA500'}
          />
          <Gauge
            value={(stats.signedCount / stats.totalCount) * 100}
            label={t('status.signed')}
            color={isDarkMode ? '#2196F3' : '#2196F3'}
          />
        </div>

        {/* Region Distribution */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {t('stats.regionDistribution')}
          </h3>
          <RegionChart
            data={Object.entries(stats.byRegion).map(([region, count]) => ({
              region: t(`regions.${region.toLowerCase()}`),
              count
            }))}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(Statistics);