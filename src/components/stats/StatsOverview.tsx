import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hospital, LineChart, Building } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectHospitalStatistics } from '@/store/selectors/hospitalSelectors';
import { StatsCard } from './StatsCard';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const StatsOverview: React.FC = () => {
  const { t } = useTranslation();
  const stats = useAppSelector(selectHospitalStatistics);

  const overviewData = [
    {
      title: t('stats.totalHospitals'),
      value: stats.totalCount,
      icon: <Hospital className="w-5 h-5" />,
      trend: {
        value: ((stats.totalCount - stats.lastMonthTotal) / stats.lastMonthTotal) * 100,
        direction: stats.totalCount >= stats.lastMonthTotal ? 'up' : 'down',
        label: t('stats.vsLastMonth')
      }
    },
    {
      title: t('stats.deploymentRate'),
      value: Math.round((stats.deployedCount / stats.totalCount) * 100),
      icon: <LineChart className="w-5 h-5" />,
      suffix: '%',
      trend: {
        value: stats.deploymentRateChange,
        direction: stats.deploymentRateChange >= 0 ? 'up' : 'down',
        label: t('stats.change')
      }
    },
    {
      title: t('stats.activeRegions'),
      value: Object.keys(stats.byRegion).length,
      icon: <Building className="w-5 h-5" />,
      trend: {
        value: stats.regionGrowth,
        direction: stats.regionGrowth > 0 ? 'up' : 'neutral',
        label: t('stats.newRegions')
      }
    }
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {overviewData.map((item, index) => (
        <motion.div
          key={index}
          variants={item}
          className="flex-1"
        >
          <StatsCard
            title={item.title}
            value={item.value}
            trend={item.trend}
            suffix={item.suffix}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default React.memo(StatsOverview);