import React, { useCallback } from 'react';
import { formatDateDefault } from '../utils/date-utils';

interface TimelinePointProps {
  date: string;
  index: number;
  currentDateIndex: number;
  hospitalName: string | null;
  isActive: boolean;
  pointWidth: number;
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
      <div className="timeline-date">{formatDateDefault(new Date(date))}</div>

      {/* Interactive Point */}
      <button
        className={`timeline-point border-2 border-blue-500 ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`.trim()}
        onClick={handlePointClick}
        // Using template literal for aria-label construction
        aria-label={`${translate('Select date')} ${formatDateDefault(new Date(date))}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {(index <= currentDateIndex) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '14px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)',
            zIndex: 10
          }}>
            ✓
          </div>
        )}
      </button>

      <div
        className="timeline-hospital-name"
        title={hospitalName ? hospitalName : translate('Unknown Event')}
      >
        {hospitalName ? hospitalName : translate('Unknown Event')}
      </div>
    </div>
  );
};

// Memoize the component for performance optimization
export default React.memo(TimelinePoint);