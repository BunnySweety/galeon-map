'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useLingui } from '@lingui/react';
import { useMapStore } from '../../store/useMapStore';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export default function MobileTimeline() {
  const { i18n } = useLingui();
  const { hospitals, currentDate, setCurrentDate } = useMapStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const _ = useCallback(
    (text: string) => {
      try {
        return i18n?._ ? i18n._(text) : text;
      } catch {
        return text;
      }
    },
    [i18n]
  );

  // Créer les points de timeline uniques
  const timelinePoints = useMemo(() => {
    const points = new Map<string, { date: string; hospitals: typeof hospitals }>();
    
    hospitals.forEach(hospital => {
      const date = hospital.deploymentDate;
      if (!points.has(date)) {
        points.set(date, { date, hospitals: [] });
      }
      points.get(date)!.hospitals.push(hospital);
    });

    return Array.from(points.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [hospitals]);

  const currentIndex = useMemo(() => {
    return timelinePoints.findIndex(point => point.date === currentDate);
  }, [timelinePoints, currentDate]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentIndex < timelinePoints.length - 1) {
      intervalRef.current = setTimeout(() => {
        const nextPoint = timelinePoints[currentIndex + 1];
        if (nextPoint) {
          setCurrentDate(nextPoint.date);
        } else {
          setIsPlaying(false);
        }
      }, 2000);
    } else if (isPlaying && currentIndex === timelinePoints.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, currentIndex, timelinePoints, setCurrentDate]);

  const handlePlayPause = useCallback(() => {
    if (currentIndex === timelinePoints.length - 1 && !isPlaying && timelinePoints.length > 0) {
      // Reset to beginning if at the end
      const firstPoint = timelinePoints[0];
      if (firstPoint) {
        setCurrentDate(firstPoint.date);
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentIndex, timelinePoints, setCurrentDate]);

  const handlePointClick = useCallback((date: string) => {
    setCurrentDate(date);
    setIsPlaying(false);
  }, [setCurrentDate]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevPoint = timelinePoints[currentIndex - 1];
      if (prevPoint) {
        setCurrentDate(prevPoint.date);
      }
      setIsPlaying(false);
    }
  }, [currentIndex, timelinePoints, setCurrentDate]);

  const handleNext = useCallback(() => {
    if (currentIndex < timelinePoints.length - 1) {
      const nextPoint = timelinePoints[currentIndex + 1];
      if (nextPoint) {
        setCurrentDate(nextPoint.date);
      }
      setIsPlaying(false);
    }
  }, [currentIndex, timelinePoints, setCurrentDate]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.locale === 'fr' ? fr : enUS;
    return format(date, 'dd MMM yyyy', { locale });
  }, [i18n.locale]);

  const getDeployedCount = useCallback((upToDate: string) => {
    return hospitals.filter(h => 
      h.status === 'Deployed' && new Date(h.deploymentDate) <= new Date(upToDate)
    ).length;
  }, [hospitals]);

  return (
    <div className="h-full bg-slate-900 flex flex-col" data-testid="mobile-timeline">
      {/* Header with Controls */}
      <div className="px-4 py-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">{_('Deployment Timeline')}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={_('Previous')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handlePlayPause}
              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              aria-label={isPlaying ? _('Pause') : _('Play')}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === timelinePoints.length - 1}
              className="p-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={_('Next')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Date Display */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1">{_('Current Date')}</p>
          <p className="text-white font-semibold text-xl">{formatDate(currentDate)}</p>
          <p className="text-blue-400 text-sm mt-1">
            {getDeployedCount(currentDate)} {_('hospitals deployed')}
          </p>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="relative pb-20">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-700"></div>

          {/* Timeline Points */}
          {timelinePoints.map((point, index) => {
            const isPast = new Date(point.date) <= new Date(currentDate);
            const isCurrent = point.date === currentDate;
            const deployedCount = getDeployedCount(point.date);

            return (
              <motion.div
                key={point.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-start mb-6"
              >
                {/* Timeline Dot */}
                <button
                  onClick={() => handlePointClick(point.date)}
                  className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50' 
                      : isPast 
                        ? 'bg-slate-600 hover:bg-slate-500' 
                        : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {isPast && !isCurrent ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : (
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  )}

                  {/* Pulse animation for current */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ opacity: 0.3 }}
                    />
                  )}
                </button>

                {/* Content */}
                <div className={`ml-6 flex-1 ${!isPast && 'opacity-50'}`}>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                    <p className="text-white font-medium mb-1">
                      {formatDate(point.date)}
                    </p>
                    <p className="text-slate-400 text-sm mb-2">
                      {point.hospitals.length} {point.hospitals.length === 1 ? _('hospital') : _('hospitals')}
                    </p>
                    
                    {/* Hospital Names */}
                    <div className="space-y-1">
                      {point.hospitals.map(hospital => (
                        <div key={hospital.id} className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            hospital.status === 'Deployed' ? 'bg-blue-400' : 'bg-green-400'
                          }`}></span>
                          <span className="text-slate-300 text-sm">{hospital.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    {isPast && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-blue-400 text-sm font-medium">
                          {deployedCount} {_('total deployed')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
            animate={{ width: `${((currentIndex + 1) / timelinePoints.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-slate-400 text-xs mt-2">
          {currentIndex + 1} / {timelinePoints.length} {_('dates')}
        </p>
      </div>
    </div>
  );
}
