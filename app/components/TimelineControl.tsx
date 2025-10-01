// File: app/components/TimelineControl.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLingui } from '@lingui/react';
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

  // Windowed layout state
  const [pointWidthPx, setPointWidthPx] = useState(240);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(9);

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

  const getPointWidth = useCallback(() => pointWidthPx, [pointWidthPx]);

  // calculateCenterOffset supprimé; l'offset est géré par l'effet fenêtré

  // Recalcul fenêtré: taille par point, indices visibles, offset de centrage
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || timelineDates.length === 0) return;

    const containerWidth = container.offsetWidth;
    const computedStyle = window.getComputedStyle(container);
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const visibleWidth = containerWidth - paddingRight;
    if (visibleWidth <= 0) return;

    // Densité cible par device (plus de points visibles)
    const targetCount = isSmallMobile ? 9 : isMobileView ? 11 : 13;
    // Taille mini/maxi par point (écart réduit)
    const minPx = isSmallMobile ? 140 : isMobileView ? 150 : 160;
    const maxPx = isSmallMobile ? 180 : isMobileView ? 190 : 200;

    // Calcule une largeur qui fasse rentrer targetCount points
    let px = Math.floor(visibleWidth / targetCount);
    px = Math.min(maxPx, Math.max(minPx, px));

    // Calcule le repère (séparateur de la barre d'action) comme ancre
    let anchor = visibleWidth / 2;
    try {
      const actionBarEl = document.querySelector('.action-bar-container') as HTMLElement | null;
      if (actionBarEl) {
        const actionRect = actionBarEl.getBoundingClientRect();
        const scrollRect = container.getBoundingClientRect();
        anchor = Math.max(
          0,
          Math.min(visibleWidth, actionRect.left + actionRect.width / 2 - scrollRect.left)
        );
      }
    } catch {}

    // Si l'actif est le dernier, recentrer strictement
    if (currentDateIndex === timelineDates.length - 1) {
      anchor = visibleWidth / 2;
    }

    // Capacités gauche/droite en nombre de points entiers (utiliser round pour limiter la dérive)
    const leftCap = Math.round(anchor / px);
    const rightCap = Math.round((visibleWidth - anchor) / px);
    const count = Math.max(3, Math.min(timelineDates.length, leftCap + 1 + rightCap));

    // Début de fenêtre pour aligner l'actif sur l'ancre
    let start = currentDateIndex - leftCap;
    if (start < 0) start = 0;
    if (start + count > timelineDates.length) start = Math.max(0, timelineDates.length - count);

    setPointWidthPx(px);
    setVisibleStartIndex(start);
    setVisibleCount(count);

    // Offset pour aligner l'actif sur l'ancre, indépendamment de start
    const offset = Math.round(anchor - (currentDateIndex * px + px / 2));
    setDragOffset(offset);
  }, [timelineDates.length, currentDateIndex, isMobileView, isSmallMobile]);

  // Plus aucun recalcul concurrent de l'offset ici; évite les sauts visuels

  // Drag désactivé pour garantir un centrage constant du point actif

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

  // Keyboard navigation for timeline
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!timelineDates.length) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          if (currentDateIndex > 0) {
            const prevIndex = currentDateIndex - 1;
            const prevDate = timelineDates[prevIndex];
            if (prevDate) {
              if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
              setCurrentDateIndex(prevIndex);
              setCurrentDate(prevDate);
              setTimelineState(prevIndex, timelineDates.length);
            }
          }
          break;

        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          if (currentDateIndex < timelineDates.length - 1) {
            const nextIndex = currentDateIndex + 1;
            const nextDate = timelineDates[nextIndex];
            if (nextDate) {
              if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
              setCurrentDateIndex(nextIndex);
              setCurrentDate(nextDate);
              setTimelineState(nextIndex, timelineDates.length);
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          if (currentDateIndex !== 0) {
            const firstDate = timelineDates[0];
            if (firstDate) {
              if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
              setCurrentDateIndex(0);
              setCurrentDate(firstDate);
              setTimelineState(0, timelineDates.length);
            }
          }
          break;

        case 'End':
          e.preventDefault();
          handleSkip();
          break;
      }
    },
    [currentDateIndex, timelineDates, setCurrentDate, setTimelineState, handleSkip]
  );

  // --- JSX Structure ---

  // Calculate timeline position based on screen size
  const timelinePosition = isMobileView
    ? 'absolute top-[var(--standard-spacing)] left-[var(--standard-spacing)] right-[var(--standard-spacing)] z-50'
    : 'absolute top-[var(--standard-spacing)] left-[calc(var(--standard-spacing)*5+clamp(260px,18vw,320px))] right-[var(--standard-spacing)] z-20';

  return (
    <div className={`${timelinePosition} ${className}`}>
      {/* Outer container with background/border */}
      <div
        className={`timeline-container ${
          isMobileView
            ? 'p-[var(--standard-spacing)] rounded-[16px] border border-white/15 backdrop-blur-[17.5px] bg-[rgba(217,217,217,0.05)]'
            : 'h-[clamp(120px,16vh,180px)] rounded-2xl bg-gradient-to-r from-[rgba(71,154,243,0.5)] to-[rgba(71,154,243,0.1)] backdrop-blur-[17.5px]'
        }`}
        role="region"
        aria-label={_('Timeline')}
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
            role="slider"
            aria-label={_('Timeline slider')}
            aria-valuemin={0}
            aria-valuemax={timelineDates.length - 1}
            aria-valuenow={currentDateIndex}
            aria-valuetext={timelineDates[currentDateIndex] || ''}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            // Dragging disabled; we always center the active point
            style={{
              touchAction: 'pan-y', // Allow vertical scroll on page, horizontal handled by useDrag
              clipPath: isMobileView
                ? isSmallMobile
                  ? 'inset(0 78px 0 0)'
                  : 'inset(0 68px 0 0)'
                : 'inset(0 100px 0 0)', // Ajusté pour que la barre s'arrête au bouton Skip
            }}
          >
            {/* Wrapper for the visual bar, centered */}
            <div
              style={{
                position: 'absolute',
                left: '0px',
                right: isMobileView ? (isSmallMobile ? '78px' : '68px') : '100px', // Ajusté pour que la barre s'arrête au bouton Skip
                top: '50%',
                transform: 'translateY(-50%)',
                height: '2px',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
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
                style={(() => {
                  const style: React.CSSProperties = {
                    position: 'absolute',
                    height: '100%',
                    background: '#479AF3',
                    transition: 'width 0.3s ease, left 0.3s ease',
                    top: '0',
                    left: '0',
                    width: '0px',
                  };

                  const scrollContainer = scrollContainerRef.current;
                  if (!scrollContainer || timelineDates.length === 0) return style;

                  const pointWidth = getPointWidth();
                  const scrollContainerWidth = scrollContainer.offsetWidth;
                  const computedStyle = window.getComputedStyle(scrollContainer);
                  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
                  const visibleWidth = scrollContainerWidth - paddingRight;
                  let anchor = visibleWidth / 2;
                  try {
                    const actionBarEl = document.querySelector(
                      '.action-bar-container'
                    ) as HTMLElement | null;
                    if (actionBarEl) {
                      const actionRect = actionBarEl.getBoundingClientRect();
                      const scrollRect = scrollContainer.getBoundingClientRect();
                      const anchorX = actionRect.left + actionRect.width / 2; // separator at center
                      anchor = Math.max(0, Math.min(visibleWidth, anchorX - scrollRect.left));
                    }
                  } catch {}
                  if (currentDateIndex === timelineDates.length - 1) {
                    anchor = visibleWidth / 2;
                  }

                  // Déterminer le premier index visible pour garder l'actif aligné avec l'ancre (séparateur)
                  // On aligne l'actif sur l'ancre et on découpe la barre à droite
                  const actionBarEl = document.querySelector(
                    '.action-bar-container'
                  ) as HTMLElement | null;
                  const halfCount = Math.round(anchor / pointWidth);
                  const firstVisibleIndex = Math.max(0, currentDateIndex - halfCount);

                  // Centre du premier point visible et de l'actif
                  const firstVisibleCenter =
                    anchor - (currentDateIndex - firstVisibleIndex) * pointWidth;
                  const activeCenter = anchor;

                  const leftPx = Math.max(0, Math.min(visibleWidth, firstVisibleCenter));
                  const widthPx = Math.max(
                    0,
                    Math.min(visibleWidth - leftPx, activeCenter - leftPx)
                  );

                  style.left = `${leftPx}px`;
                  style.width = `${widthPx}px`;

                  return style;
                })()}
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

                // Fenêtrage: afficher seulement la tranche visible
                if (index < visibleStartIndex || index >= visibleStartIndex + visibleCount) {
                  return null;
                }

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
