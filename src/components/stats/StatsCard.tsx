import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  prefix?: string;
  suffix?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  prefix = '',
  suffix = ''
}) => {
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4" />;
      default:
        return <MinusIcon className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>

      <motion.div
        className="mt-2 flex items-baseline"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {prefix && (
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
            {prefix}
          </span>
        )}
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </span>
        {suffix && (
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            {suffix}
          </span>
        )}
      </motion.div>

      {trend && (
        <div className="mt-2 flex items-center">
          <span className={`inline-flex items-center text-sm ${getTrendColor(trend.direction)}`}>
            {getTrendIcon(trend.direction)}
            <span className="ml-1 font-medium">
              {trend.value}%
            </span>
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          {trend.label}
            </span>
          </span>
        </div>
      )}
      
      <div className="mt-1">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <motion.div
            className="bg-blue-600 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(StatsCard);