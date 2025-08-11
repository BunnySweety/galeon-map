import React, { useCallback } from 'react';
import { formatDateDefault } from '../utils/date-utils';

interface TimelinePointProps {
  date: string;
  index: number;
  currentDateIndex: number;
  hospitalName: string | null;
  isActive: boolean;
  pointWidth: number;
  dateFormat: string;
  onPointClick: (date: string, index: number) => void;
  translate: (key: string) => string; // Function for translation
}

const TimelinePoint: React.FC<TimelinePointProps> = ({
  date,
  index,
  currentDateIndex,
  hospitalName,
  isActive,
  pointWidth,
  dateFormat,
  onPointClick,
  translate,
}) => {
  const isPast = index < currentDateIndex;

  // Handlers optimisés
  const handlePointClick = useCallback(() => {
    onPointClick(date, index);
  }, [onPointClick, date, index]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onPointClick(date, index);
    }
  }, [onPointClick, date, index]);

  return (
    <div
      className={`timeline-point-container ${isActive ? 'active' : ''}`}
      style={{ width: `${pointWidth}px` }}
      role="group"
      // Using template literal for aria-label construction
      aria-label={`${translate('Timeline group for')} ${formatDateDefault(new Date(date))}`}
    >
      {/* Use dynamic dateFormat */}
      <div className="timeline-date text-xs md:text-sm">{formatDateDefault(new Date(date))}</div>

      {/* Interactive Point */}
      <button
        className={`timeline-point border-2 border-blue-500 rounded-full flex items-center justify-center w-12 h-12 md:w-6 md:h-6 ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`.trim()}
        onClick={handlePointClick}
        // Using template literal for aria-label construction
        aria-label={`${translate('Select date')} ${formatDateDefault(new Date(date))}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {index <= currentDateIndex && (
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="timeline-hospital-name text-xs md:text-sm">
        {hospitalName ? hospitalName : translate('Unknown Event')}
      </div>
    </div>
  );
};

// Memoize the component for performance optimization
export default React.memo(TimelinePoint);
