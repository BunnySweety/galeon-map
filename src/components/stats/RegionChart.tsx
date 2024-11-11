import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/useTheme';

interface RegionData {
  region: string;
  count: number;
}

interface RegionChartProps {
  data: RegionData[];
}

export const RegionChart: React.FC<RegionChartProps> = ({ data }) => {
  const { isDarkMode } = useTheme();

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.count - a.count);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {`Hospitals: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="region"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            stroke={isDarkMode ? '#9CA3AF' : '#4B5563'}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke={isDarkMode ? '#9CA3AF' : '#4B5563'}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          />
          <Bar
            dataKey="count"
            fill={isDarkMode ? '#3B82F6' : '#2563EB'}
            radius={[4, 4, 0, 0]}
          >
            {sortedData.map((entry, index) => (
              <motion.cell
                key={`cell-${index}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(RegionChart);