// File: app/components/TimelineControl.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLingui } from '@lingui/react';
import { format } from 'date-fns';
import { useMapStore } from '../store/useMapStore';

interface TimelineControlProps {
  className?: string;
}

const TimelineControl: React.FC<TimelineControlProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  
  // Create a safe translation function that handles undefined i18n
  const _ = useCallback((text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  }, [i18n]);
  
  const { 
    hospitals, 
    currentDate, 
    setCurrentDate, 
    selectedHospital,
    isPlaying,
    setIsPlaying
  } = useMapStore();
  
  const [timelineDates, setTimelineDates] = useState<string[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  
  // Utilisez useRef pour stocker la date courante et éviter les problèmes de rendu
  const currentDateRef = useRef(currentDate);
  currentDateRef.current = currentDate;

  // Extract unique deployment dates
  useEffect(() => {
    if (!hospitals.length) return;
    
    // Extract and sort unique dates
    const dates = [...new Set(hospitals.map(h => h.deploymentDate))].sort();
    setTimelineDates(dates);
    
    // Find the index of the current date in the timeline
    const index = dates.findIndex(date => date === currentDate);
    setCurrentDateIndex(index > -1 ? index : dates.length - 1);
  }, [hospitals, currentDate]);

  // Auto-play timeline animation
  useEffect(() => {
    if (!isPlaying || !timelineDates.length) return;
    
    const interval = setInterval(() => {
      setCurrentDateIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        
        // If we reached the end, stop playing
        if (newIndex >= timelineDates.length) {
          setIsPlaying(false);
          return prevIndex;
        }
        
        // Update current date
        setCurrentDate(timelineDates[newIndex]);
        return newIndex;
      });
    }, 1500); // Change every 1.5 seconds
    
    return () => clearInterval(interval);
  }, [isPlaying, timelineDates, setCurrentDate, setIsPlaying]);

  // Skip to the end of the timeline
  const handleSkip = useCallback(() => {
    if (!timelineDates.length) return;
    
    const lastDate = timelineDates[timelineDates.length - 1];
    setCurrentDate(lastDate);
    setCurrentDateIndex(timelineDates.length - 1);
    setIsPlaying(false);
  }, [timelineDates, setCurrentDate, setIsPlaying]);

  // Handle timeline point click
  const handlePointClick = useCallback((date: string, index: number) => {
    setCurrentDate(date);
    setCurrentDateIndex(index);
    setIsPlaying(false);
  }, [setCurrentDate, setIsPlaying]);

  useEffect(() => {
    if (currentDateIndex >= timelineDates.length - 1) {
      setIsPlaying(false);
    }
  }, [timelineDates.length, currentDateIndex, setIsPlaying]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (currentDateIndex >= timelineDates.length - 1) {
      setCurrentDateIndex(0);
      setCurrentDate(timelineDates[0]);
    }
    setIsPlaying(!isPlaying);
  }, [currentDateIndex, timelineDates, setCurrentDate, setIsPlaying, isPlaying]);

  // Handle reset
  const handleReset = useCallback(() => {
    setCurrentDateIndex(0);
    setCurrentDate(timelineDates[0]);
    setIsPlaying(false);
  }, [timelineDates, setCurrentDate, setIsPlaying]);

  return (
    <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 
      w-[1415px] h-[64px] rounded-2xl 
      bg-gradient-to-r from-[rgba(71,154,243,0.5)] to-[rgba(71,154,243,0.1)] 
      backdrop-blur-[17.5px] flex items-center justify-center z-20 ${className}`}>
      <div className="relative w-[90%] h-10">
        {/* Timeline bar */}
        <div className="absolute w-full h-1 bg-blue-500/30 top-1/2 -translate-y-1/2 rounded"></div>
        
        {/* Timeline progress */}
        <div 
          className="absolute h-1 bg-blue-500 top-1/2 -translate-y-1/2 rounded" 
          style={{ width: `${(currentDateIndex / (timelineDates.length - 1)) * 100}%` }}
        ></div>
        
        {/* Timeline points */}
        {timelineDates.map((date, index) => (
          <button
            key={date}
            className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full 
              ${index <= currentDateIndex 
                ? 'bg-blue-500 border-2 border-white' 
                : 'bg-white border-2 border-blue-300'
              }`}
            style={{ left: `${(index / (timelineDates.length - 1)) * 100}%` }}
            onClick={() => handlePointClick(date, index)}
          >
            {index <= currentDateIndex && (
              <svg className="w-full h-full p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
        ))}
        
        {/* Skip button */}
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 
            px-4 py-2 bg-slate-800/70 text-white rounded text-sm"
          onClick={handleSkip}
        >
          {_('Skip')}
        </button>
      </div>
      
      {/* Selected hospital name and date */}
      {selectedHospital && (
        <div className="absolute bottom-2 text-center w-full text-white text-lg font-semibold">
          {selectedHospital.name} - {format(new Date(currentDate), 'dd/MM/yyyy')}
        </div>
      )}
    </div>
  );
};

export default TimelineControl;