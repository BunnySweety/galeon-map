// File: app/components/TimelineControl.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLingui } from '@lingui/react';
import { useDrag } from '@use-gesture/react';
import { useMapStore } from '../store/useMapStore';
import TimelinePoint from './TimelinePoint';

interface TimelineControlProps {
  className?: string;
}

const TimelineControl: React.FC<TimelineControlProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  const { hospitals, setCurrentDate, setTimelineState, language } = useMapStore();
  const [timelineDates, setTimelineDates] = useState<string[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false); // For < 480px
  const [dragOffset, setDragOffset] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false); // Ref to track initialization

  // Check screen sizes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768);
      setIsSmallMobile(width <= 480);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create a safe translation function
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

  // Extract unique deployment dates and set initial index ONCE
  useEffect(() => {
    // Only run if hospitals are loaded and initialization hasn't happened yet
    if (!hospitals.length || isInitializedRef.current) return;

    const dates = [...new Set(hospitals.map(h => h.deploymentDate))].sort();
    setTimelineDates(dates);

    // --- Ensure store's currentDate is the actual first date ON INIT ---
    const firstDate = dates[0];
    // Get the store's current date at this moment
    const storeCurrentDate = useMapStore.getState().currentDate;

    let dateToUseForIndex = storeCurrentDate;

    if (firstDate && storeCurrentDate !== firstDate) {
      // If the store's date isn't the first one, update the store.
      setCurrentDate(firstDate);
      // Use the first date to determine the initial index
      dateToUseForIndex = firstDate;
    }
    // else: Store date is already correct, use it for index.

    // Find index based on the date we decided to use (either store's or firstDate)
    const index = dates.findIndex(date => date === dateToUseForIndex);
    setCurrentDateIndex(index > -1 ? index : 0);
    // --- End Ensure store date ---

    // Mark initialization as complete
    isInitializedRef.current = true;

    // Set initial timeline state in the store
    setTimelineState(index > -1 ? index : 0, dates.length);
  }, [hospitals, setCurrentDate, setTimelineState]); // Added setTimelineState dependency

  // Animate timeline progression
  useEffect(() => {
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    const animateTimeline = () => {
      if (currentDateIndex < timelineDates.length - 1) {
        const nextIndex = currentDateIndex + 1;
        setCurrentDateIndex(nextIndex);
        const nextDate = timelineDates[nextIndex];
        if (nextDate) {
          setCurrentDate(nextDate);
        }
        setTimelineState(nextIndex, timelineDates.length); // Update store on animation
      }
    };
    animationTimeoutRef.current = setTimeout(animateTimeline, 4000);
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [currentDateIndex, timelineDates, setCurrentDate, setTimelineState]); // Added setTimelineState dependency

  // Find hospital for a specific date
  const getHospitalForDate = (date: string) => {
    return hospitals.find(h => h.deploymentDate === date);
  };

  // --- Centering and Drag Logic ---

  const getPointWidth = useCallback(() => {
    // Corresponds to CSS variables --timeline-point-width-lg/sm
    return isSmallMobile ? 120 : 160;
  }, [isSmallMobile]);

  // Calculate the offset to center the active point
  const calculateCenterOffset = useCallback(
    (index: number) => {
      if (!scrollContainerRef.current || timelineDates.length === 0) return 0;

      const scrollContainer = scrollContainerRef.current;
      const scrollContainerWidth = scrollContainer.offsetWidth;
      const pointWidth = getPointWidth();
      const totalPointsWidth = timelineDates.length * pointWidth;

      // --- Calculate Visible Width ---
      const computedStyle = window.getComputedStyle(scrollContainer);
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      const visibleWidth = scrollContainerWidth - paddingRight;
      // --- End Visible Width ---

      // If visibleWidth is invalid or too small, fallback or return 0
      if (visibleWidth <= 0) return 0;

      // Center of the *visible* scroll container window
      const containerCenter = visibleWidth / 2;

      // Position of the center of the target point relative to the start of the points container
      const targetPointCenter = index * pointWidth + pointWidth / 2;

      // Calculate the necessary transform offset (negative scrollLeft)
      let offset = -(targetPointCenter - containerCenter);

      // Calculate bounds for the offset
      const maxOffset = 0; // Cannot scroll further left than the start
      // Minimum offset: prevents scrolling empty space into view on the right.
      // Right edge of content (totalPointsWidth + offset) should not be less than visibleWidth.
      // totalPointsWidth + offset >= visibleWidth  => offset >= visibleWidth - totalPointsWidth
      const minOffset = visibleWidth - totalPointsWidth;

      // Clamp the offset within the calculated bounds
      offset = Math.max(Math.min(offset, maxOffset), minOffset);

      // If total content is smaller than the visible area, no offset is needed
      if (totalPointsWidth <= visibleWidth) {
        offset = 0;
      }

      return offset;
    },
    [timelineDates.length, getPointWidth]
  );

  // Recalculate offset on resize or when point width changes (or index changes)
  useEffect(() => {
    // Debounce or throttle resize handling if performance becomes an issue
    const newOffset = calculateCenterOffset(currentDateIndex);
    setDragOffset(newOffset);
  }, [calculateCenterOffset, currentDateIndex, isSmallMobile /* add window width if needed */]);

  // Update dragOffset when currentDateIndex changes programmatically
  useEffect(() => {
    const newOffset = calculateCenterOffset(currentDateIndex);
    if (scrollContainerRef.current) {
      const pointsContainer = scrollContainerRef.current.querySelector(
        '.timeline-points-container'
      ) as HTMLElement;
      if (pointsContainer) {
        pointsContainer.style.transition = 'transform 0.3s ease';
      }
    }
    setDragOffset(newOffset);

    // No need to cleanup transition here usually, CSS handles it.
    // If issues arise, can add back timeout to set transition to 'none'.
  }, [currentDateIndex, calculateCenterOffset]); // Dependencies are correct

  // Handle manual timeline dragging
  const bind = useDrag(
    ({ movement, down, last, velocity, memo }) => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);

      if (down && memo === undefined) {
        memo = dragOffset;
        if (scrollContainerRef.current) {
          const pointsContainer = scrollContainerRef.current.querySelector(
            '.timeline-points-container'
          ) as HTMLElement;
          if (pointsContainer) {
            pointsContainer.style.transition = 'none';
          }
        }
      }

      if (down) {
        const pointWidth = getPointWidth();
        const totalPointsWidth = timelineDates.length * pointWidth;
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return memo; // Exit if ref is null

        const scrollContainerWidth = scrollContainer.offsetWidth;
        // --- Calculate Visible Width (same as in calculateCenterOffset) ---
        const computedStyle = window.getComputedStyle(scrollContainer);
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const visibleWidth = scrollContainerWidth - paddingRight;
        // --- End Visible Width ---

        if (visibleWidth <= 0) return memo; // Exit if width is invalid

        // Calculate bounds for drag based on visibleWidth
        const maxDrag = 0;
        const minDrag = visibleWidth - totalPointsWidth;

        let newDragOffset = memo + movement[0];
        // Clamp the drag offset
        newDragOffset = Math.max(Math.min(newDragOffset, maxDrag), minDrag);

        // Prevent dragging if all content fits within the visible area
        if (totalPointsWidth <= visibleWidth) {
          newDragOffset = 0;
        }

        setDragOffset(newDragOffset);
      }

      if (last) {
        const pointWidth = getPointWidth();
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return memo; // Exit if ref is null

        const scrollContainerWidth = scrollContainer.offsetWidth;
        // --- Calculate Visible Width (again) ---
        const computedStyle = window.getComputedStyle(scrollContainer);
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const visibleWidth = scrollContainerWidth - paddingRight;
        // --- End Visible Width ---

        if (visibleWidth <= 0) return memo; // Exit if width is invalid

        // Handle swipe gesture
        const velocityArray = Array.isArray(velocity) ? velocity : [velocity || 0];
        if (Math.abs(velocityArray[0] || 0) > 0.5) {
          const direction = (velocityArray[0] || 0) > 0 ? -1 : 1;
          const targetIndex = Math.max(
            0,
            Math.min(currentDateIndex + direction, timelineDates.length - 1)
          );
          setCurrentDateIndex(targetIndex);
          const targetDate = timelineDates[targetIndex];
          if (targetDate) {
            setCurrentDate(targetDate);
          }
          setTimelineState(targetIndex, timelineDates.length); // Update store on swipe
        } else {
          // If not a swipe, snap to the nearest point's center within the visible area
          const containerCenter = visibleWidth / 2;
          const currentTransformOffset = dragOffset;
          const centerRelativeToContentStart = -currentTransformOffset + containerCenter;
          const closestIndex = Math.round(
            (centerRelativeToContentStart - pointWidth / 2) / pointWidth
          );
          const finalIndex = Math.max(0, Math.min(closestIndex, timelineDates.length - 1));

          if (finalIndex !== currentDateIndex) {
            setCurrentDateIndex(finalIndex);
            const finalDate = timelineDates[finalIndex];
            if (finalDate) {
              setCurrentDate(finalDate);
            }
            setTimelineState(finalIndex, timelineDates.length); // Update store on snap
          } else {
            const newOffset = calculateCenterOffset(currentDateIndex); // Recalculate correct center
            if (scrollContainerRef.current) {
              const pointsContainer = scrollContainerRef.current.querySelector(
                '.timeline-points-container'
              ) as HTMLElement;
              if (pointsContainer) {
                pointsContainer.style.transition = 'transform 0.3s ease'; // Ensure smooth snap
              }
            }
            setDragOffset(newOffset);
          }
        }
      }
      return memo;
    },
    {
      axis: 'x',
      rubberband: 0.1,
      threshold: 5,
    }
  );

  // Handle click on timeline point
  const handlePointClick = useCallback(
    (date: string, index: number) => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      setCurrentDateIndex(index);
      setCurrentDate(date);
      setTimelineState(index, timelineDates.length); // Update store on click
      // Offset is handled by useEffect for currentDateIndex
    },
    [setCurrentDate, setTimelineState, timelineDates.length]
  );

  // Skip to the end of the timeline
  const handleSkip = useCallback(() => {
    if (!timelineDates.length) return;
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    const lastDate = timelineDates[timelineDates.length - 1];
    const lastIndex = timelineDates.length - 1;
    if (lastDate) {
      setCurrentDate(lastDate);
    }
    setCurrentDateIndex(lastIndex);
    setTimelineState(lastIndex, timelineDates.length); // Update store on skip
    // Offset is handled by useEffect for currentDateIndex
  }, [timelineDates, setCurrentDate, setTimelineState]); // Added setTimelineState dependency

  // --- JSX Structure ---

  // Calculate timeline position based on screen size
  const timelinePosition = isMobileView
    ? 'absolute top-[var(--standard-spacing)] left-[var(--standard-spacing)] right-[var(--standard-spacing)] z-50'
    : 'absolute top-[var(--standard-spacing)] left-[calc(var(--standard-spacing)*2+clamp(280px,22vw,340px))] right-[var(--standard-spacing)] z-20';

  return (
    <div className={`${timelinePosition} ${className}`} data-testid="timeline-root">
      {/* Outer container with background/border */}
      <div
        className={`timeline-container ${
          isMobileView
            ? 'p-[var(--standard-spacing)] rounded-[16px] border border-white/15 backdrop-blur-[17.5px] bg-[rgba(217,217,217,0.05)]'
            : 'h-[clamp(120px,16vh,180px)] rounded-2xl bg-gradient-to-r from-[rgba(71,154,243,0.5)] to-[rgba(71,154,243,0.1)] backdrop-blur-[17.5px]'
        }`}
        style={
          {
            '--timeline-bg-color': isMobileView ? 'rgba(217,217,217,0.05)' : 'rgba(71,154,243,0.1)',
          } as React.CSSProperties
        }
      >
        {/* Inner container managing layout */}
        <div className="relative w-full h-full flex items-center">
          {/* Scrollable Area (takes full width except button) */}
          <div
            ref={scrollContainerRef}
            className="timeline-scroll-container hide-scrollbar"
            {...bind()}
            style={{
              touchAction: 'pan-y', // Allow vertical scroll on page, horizontal handled by useDrag
              clipPath: isMobileView 
                ? (isSmallMobile ? 'inset(0 78px 0 0)' : 'inset(0 68px 0 0)') 
                : 'inset(0 100px 0 0)', // Ajusté pour que la barre s'arrête au bouton Skip
            }}
          >
            {/* Wrapper for the visual bar, centered */}
            <div
              style={{
                position: 'absolute',
                left: '0px',
                right: isMobileView 
                  ? (isSmallMobile ? '78px' : '68px') 
                  : '100px', // Ajusté pour que la barre s'arrête au bouton Skip
                top: '50%',
                transform: 'translateY(-50%)',
                height: '2px',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  height: '100%',
                  background: '#479AF3',
                  transition: 'width 0.3s ease',
                  top: '0',
                  left: '0',
                  width:
                    currentDateIndex === timelineDates.length - 1
                      ? '100%'
                      : `${((currentDateIndex + 1) / timelineDates.length) * 100}%`,
                }}
              />
            </div>

            {/* Container holding and moving all the points */}
            <div
              className="timeline-points-container"
              style={{ transform: `translateX(${dragOffset}px)` }}
            >
              {timelineDates.map((date, index) => {
                const hospital = getHospitalForDate(date);
                const isActive = index === currentDateIndex;
                const pointWidth = getPointWidth();

                // --- Determine Date Format based on Locale ---
                let dateFormat = 'dd/MM/yyyy'; // Default format
                if (i18n?.locale) {
                  if (i18n.locale.startsWith('en')) {
                    dateFormat = 'MM/dd/yyyy'; // US English format
                  }
                }
                // --- End Determine Date Format ---

                return (
                  <TimelinePoint
                    key={date}
                    date={date}
                    index={index}
                    currentDateIndex={currentDateIndex}
                    hospitalName={
                      hospital ? (language === 'fr' ? hospital.nameFr : hospital.nameEn) : null
                    }
                    isActive={isActive}
                    pointWidth={pointWidth}
                    dateFormat={dateFormat}
                    onPointClick={handlePointClick}
                    translate={_}
                  />
                );
              })}
            </div>
          </div>{' '}
          {/* End timeline-scroll-container */}
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="timeline-skip-button"
            disabled={currentDateIndex === timelineDates.length - 1}
            aria-label={_('Skip to end')}
          >
            {_('Skip')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineControl;
