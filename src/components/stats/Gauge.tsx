import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface GaugeProps {
  value: number;
  label: string;
  color: string;
  maxValue?: number;
  size?: number;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  label,
  color,
  maxValue = 100,
  size = 120
}) => {
  const gaugeRef = useRef<SVGSVGElement>(null);
  const controls = useAnimation();
  const normalizedValue = Math.min(Math.max(0, value), maxValue);
  const percentage = (normalizedValue / maxValue) * 100;

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    controls.start({
      strokeDashoffset,
      transition: { duration: 1, ease: 'easeOut' }
    });
  }, [controls, strokeDashoffset]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          ref={gaugeRef}
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference
            }}
            animate={controls}
          />
        </svg>
        
        {/* Value display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      </div>

      {/* Label */}
      <motion.span
        className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {label}
      </motion.span>
    </div>
  );
};

export default Gauge;