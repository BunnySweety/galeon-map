// File: app/components/TimelineControl.tsx
'use client';

import { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { format } from 'date-fns';
import { useMapStore } from '../store/useMapStore';

interface TimelineControlProps {
  className?: string;
}

const TimelineControl: React.FC<TimelineControlProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  // Create a safe translation function that handles undefined i18n
  const _ = (text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  };
  
  const { 
    hospitals, 
    currentDate, 
    setCurrentDate, 
    selectedHospital
  } = useMapStore();
  
  const [timelineDates, setTimelineDates] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

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
  }, [isPlaying, timelineDates, setCurrentDate]);

  // Skip to the end of the timeline
  const handleSkip = () => {
    if (!timelineDates.length) return;
    
    const lastDate = timelineDates[timelineDates.length - 1];
    setCurrentDate(lastDate);
    setCurrentDateIndex(timelineDates.length - 1);
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlay = () => {
    // If at the end, restart from beginning
    if (currentDateIndex >= timelineDates.length - 1) {
      setCurrentDateIndex(0);
      setCurrentDate(timelineDates[0]);
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`bg-slate-800 bg-opacity-80 p-4 text-white ${className}`}>
      <div className="relative">
        {/* Skip button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button 
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
            onClick={handleSkip}
          >
            {_('Skip')}
          </button>
        </div>
        
        {/* Current date */}
        <div className="flex justify-center items-center mb-4">
          <div className="flex items-center gap-4">
            {/* Play/pause button */}
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="white"></rect>
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="white"></rect>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    fill="white"
                    d="M6 4l12 8-12 8V4z"
                  ></path>
                </svg>
              )}
            </button>
            
            <p className="text-sm">
              {currentDate && format(new Date(currentDate), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex items-center justify-center mb-2">
          {timelineDates.length > 0 && (
            <div className="relative w-3/4">
              {/* Timeline bar */}
              <div className="h-1 bg-blue-500 rounded"></div>
              
              {/* Timeline points */}
              {timelineDates.map((date, index) => (
                <button
                  key={date}
                  className={`w-8 h-8 rounded-full absolute top-1/2 -translate-y-1/2 -ml-4 flex items-center justify-center
                    ${index <= currentDateIndex ? 'bg-blue-500' : 'bg-blue-300 bg-opacity-50'}`}
                  style={{ left: `${(index / (timelineDates.length - 1)) * 100}%` }}
                  onClick={() => {
                    setCurrentDate(date);
                    setCurrentDateIndex(index);
                    setIsPlaying(false);
                  }}
                >
                  {index <= currentDateIndex && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Display selected hospital name */}
        {selectedHospital && (
          <div className="text-center mt-2">
            <h3 className="text-lg font-semibold">{selectedHospital.name}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineControl;