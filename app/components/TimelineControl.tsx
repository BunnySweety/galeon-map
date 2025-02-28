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
            onClick={() => handlePointClick(date, index)}
            className={`absolute w-4 h-4 -mt-[6px] rounded-full transition-all
              ${currentDateIndex >= index ? 'bg-blue-500' : 'bg-blue-500/30'}
              ${currentDateIndex === index ? 'scale-125' : 'hover:scale-110'}`}
            style={{ left: `${(index / (timelineDates.length - 1)) * 100}%` }}
            title={date}
          />
        ))}
        
        {/* Control buttons */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            title={_("Reset")}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            title={isPlaying ? _("Pause") : _("Play")}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={handleSkip}
            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            title={_("Skip to end")}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
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