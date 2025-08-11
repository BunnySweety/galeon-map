'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLingui } from '@lingui/react';
import { useMapStore } from '../store/useMapStore';

interface TimelineItem {
  date: string;
  hospital?: {
    id: string;
    name: string;
  };
}

const MobileTimeline: React.FC = () => {
  const { i18n } = useLingui();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const {
    hospitals,
    currentDate,
    setCurrentDate,
  } = useMapStore();

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

  // Créer les données de timeline à partir des hôpitaux
  const timelineData = useMemo(() => {
    if (!hospitals || hospitals.length === 0) return [];
    
    // Grouper par date et trier
    const dateMap = new Map<string, TimelineItem>();
    
    hospitals.forEach(hospital => {
      const date = hospital.deploymentDate;
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          hospital: {
            id: hospital.id,
            name: hospital.name
          }
        });
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [hospitals]);

  // Trouver l'index actuel basé sur currentDate
  useEffect(() => {
    const index = timelineData.findIndex(item => item.date === currentDate);
    if (index >= 0) {
      setCurrentIndex(index);
    }
  }, [currentDate, timelineData]);

  // Centrer sur l'élément actuel
  useEffect(() => {
    if (timelineRef.current && currentIndex >= 0) {
      const container = timelineRef.current;
      const itemWidth = 80;
      const targetScroll = currentIndex * itemWidth - container.clientWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const handlePointClick = useCallback((index: number) => {
    if (timelineData[index]) {
      setCurrentDate(timelineData[index].date);
    }
  }, [timelineData, setCurrentDate]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && timelineData && timelineData.length > currentIndex - 1) {
      const prevItem = timelineData[currentIndex - 1];
      if (prevItem) {
        setCurrentDate(prevItem.date);
      }
    }
  }, [currentIndex, timelineData, setCurrentDate]);

  const handleNext = useCallback(() => {
    if (currentIndex < timelineData.length - 1 && timelineData && timelineData.length > currentIndex + 1) {
      const nextItem = timelineData[currentIndex + 1];
      if (nextItem) {
        setCurrentDate(nextItem.date);
      }
    }
  }, [currentIndex, timelineData, setCurrentDate]);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.locale || 'en', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, [i18n.locale]);

  const formatDateShort = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.locale || 'en', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, [i18n.locale]);

  const getYear = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch {
      return '';
    }
  }, []);

  if (!timelineData || timelineData.length === 0) {
    return null;
  }

  return (
    <div className="mobile-timeline-container">
      {/* Contrôles de navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevious}
          className="mobile-timeline-control"
          disabled={currentIndex <= 0}
          aria-label={_('Previous')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <div className="flex-1 mx-3">
          <div className="text-center text-white text-sm font-medium">
            {currentIndex + 1} / {timelineData.length}
          </div>
          <div className="text-center text-gray-400 text-xs">
            {formatDate(currentDate)}
          </div>
        </div>

        <button
          onClick={handleNext}
          className="mobile-timeline-control"
          disabled={currentIndex >= timelineData.length - 1}
          aria-label={_('Next')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      {/* Timeline scrollable */}
      <div
        ref={timelineRef}
        className="mobile-timeline-scroll"
      >
        <div className="mobile-timeline-track">
          {timelineData.map((item, index) => (
            <div
              key={`${item.date}-${index}`}
              className={`mobile-timeline-point ${
                index === currentIndex ? 'active' : ''
              } ${index < currentIndex ? 'past' : ''}`}
              onClick={() => handlePointClick(index)}
            >
              <div className="mobile-timeline-dot">
                {index < currentIndex && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
              <div className="mobile-timeline-label">
                <div className="mobile-timeline-date">{formatDateShort(item.date)}</div>
                <div className="mobile-timeline-year text-xs opacity-60">{getYear(item.date)}</div>
                {item.hospital && (
                  <div className="mobile-timeline-hospital">{item.hospital.name}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mobile-timeline-progress-container">
        <div 
          className="mobile-timeline-progress-bar"
          style={{ 
            width: `${((currentIndex + 1) / timelineData.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};

export default MobileTimeline; 