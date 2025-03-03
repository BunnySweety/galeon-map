// File: app/components/TimelineControl.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { useMapStore } from '../store/useMapStore';
import type { Hospital } from '../store/useMapStore';
import { useLingui } from '@lingui/react';
import { useDrag } from 'react-use-gesture';

interface TimelineControlProps {
  className?: string;
}

const TimelineControl: React.FC<TimelineControlProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  const { 
    hospitals, 
    currentDate, 
    setCurrentDate 
  } = useMapStore();
  
  const [timelineDates, setTimelineDates] = useState<string[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // État pour le déplacement de la timeline
  const [dragOffset, setDragOffset] = useState(0);
  const [lastMx, setLastMx] = useState(0);
  const [moveStartTime, setMoveStartTime] = useState(0);
  const [indexChangeTime, setIndexChangeTime] = useState(0);
  const [isChangingIndex, setIsChangingIndex] = useState(false);
  const [totalDragDistance, setTotalDragDistance] = useState(0); // Nouvelle variable pour suivre la distance totale
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastProcessedIndex, setLastProcessedIndex] = useState(0);

  // Create a safe translation function that handles undefined i18n
  const _ = useCallback((text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  }, [i18n]);

  // Extract unique deployment dates
  useEffect(() => {
    if (!hospitals.length) return;
    
    const dates = [...new Set(hospitals.map(h => h.deploymentDate))].sort();
    setTimelineDates(dates);
    
    const index = dates.findIndex(date => date === currentDate);
    setCurrentDateIndex(index > -1 ? index : 0);
  }, [hospitals, currentDate]);

  // Animate timeline progression
  useEffect(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    const animateTimeline = () => {
      // Move to next point if not at the end
      if (currentDateIndex < timelineDates.length - 1) {
        const nextIndex = currentDateIndex + 1;
        const nextDate = timelineDates[nextIndex];
        
        // Update current date and index
        setCurrentDate(nextDate);
        setCurrentDateIndex(nextIndex);
      }
    };

    // Set up timer for progression (increased delay to 4 seconds)
    animationTimeoutRef.current = setTimeout(animateTimeline, 4000);

    // Cleanup
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [currentDateIndex, timelineDates, setCurrentDate]);

  // Skip to the end of the timeline
  const handleSkip = useCallback(() => {
    if (!timelineDates.length) return;
    
    const lastDate = timelineDates[timelineDates.length - 1];
    setCurrentDate(lastDate);
    setCurrentDateIndex(timelineDates.length - 1);
  }, [timelineDates, setCurrentDate]);

  // Find hospital for a specific date
  const getHospitalForDate = (date: string) => {
    return hospitals.find(h => h.deploymentDate === date);
  };

  // Handle click on timeline point
  const handlePointClick = useCallback((date: string, index: number) => {
    setCurrentDateIndex(index);
    setCurrentDate(date);
    setDragOffset(0); // Réinitialiser le décalage lors d'un clic direct
  }, [setCurrentDate]);

  // Gestion du déplacement de la timeline
  const bind = useDrag(({ movement, last, velocity, first, down }) => {
    // Extraire les valeurs de mouvement et vélocité
    const mx = movement[0];
    const vx = velocity[0];
    
    // Annuler l'animation automatique au premier contact
    if (first) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      setMoveStartTime(Date.now());
      setLastMx(0);
      setTotalDragDistance(0);
      setLastProcessedIndex(currentDateIndex); // Réinitialiser l'index traité au début du geste
    }
    
    // Appliquer le déplacement pendant le glissement
    if (down) {
      // Calculer le temps écoulé depuis le début du mouvement
      const elapsedTime = Date.now() - moveStartTime;
      
      // Appliquer une rampe d'accélération pour un démarrage doux
      const accelerationFactor = Math.min(elapsedTime / 400, 1);
      
      // Calculer le delta de mouvement depuis la dernière mise à jour
      const deltaX = mx - lastMx;
      
      // Appliquer un amortissement au delta pour un mouvement plus doux
      const smoothedDeltaX = deltaX * (0.25 + accelerationFactor * 0.65);
      
      // Mettre à jour le décalage de manière progressive
      setDragOffset(prev => prev + smoothedDeltaX);
      setLastMx(mx);
      
      // Calculer l'index basé sur le décalage amorti
      const pointWidth = 160; // Largeur approximative de chaque point
      
      // Vérifier si nous sommes dans la période de verrouillage après un changement d'index
      const now = Date.now();
      const timeSinceIndexChange = now - indexChangeTime;
      
      // Si nous ne sommes pas en train de changer d'index et que suffisamment de temps s'est écoulé
      if (!isChangingIndex && timeSinceIndexChange > 350) {
        // Calculer le décalage d'index en fonction du décalage de glissement
        // Utiliser Math.round au lieu de Math.floor pour un comportement plus prévisible
        const rawOffset = dragOffset / (pointWidth / 1.8);
        const direction = Math.sign(rawOffset);
        const indexOffset = direction * Math.min(1, Math.floor(Math.abs(rawOffset)));
        
        // Ne changer l'index que si le décalage est suffisant et que nous ne sommes pas déjà à la limite
        if (indexOffset !== 0) {
          // Calculer le nouvel index potentiel
          const targetIndex = currentDateIndex - indexOffset;
          
          // Vérifier que l'index est dans les limites et qu'il est différent de l'index actuel
          if (targetIndex >= 0 && targetIndex < timelineDates.length && targetIndex !== currentDateIndex) {
            // Vérifier que nous n'avons pas déjà traité cet index ou que nous ne sautons pas d'index
            const isNextIndex = Math.abs(targetIndex - lastProcessedIndex) <= 1;
            
            if (isNextIndex) {
              setCurrentDateIndex(targetIndex);
              setCurrentDate(timelineDates[targetIndex]);
              setIsChangingIndex(true);
              setIndexChangeTime(now);
              setLastProcessedIndex(targetIndex);
              
              // Réduire partiellement le décalage pour permettre un mouvement continu
              setDragOffset(dragOffset * 0.3);
              
              // Réinitialiser après un court délai
              setTimeout(() => {
                setIsChangingIndex(false);
              }, 350);
            }
          }
        }
      }
    }
    
    // Réinitialiser lorsque le glissement est terminé
    if (last) {
      setLastMx(0);
      setMoveStartTime(0);
      setTotalDragDistance(0);
      
      // Vérifier si c'était un swipe rapide
      const swipeSpeed = Math.abs(vx);
      if (swipeSpeed > 0.25) {
        const swipeDirection = -Math.sign(vx);
        
        // Pour les swipes, limiter à un seul point à la fois pour éviter les sauts
        const pointsToMove = 1;
        
        // Calculer le nouvel index
        const targetIndex = currentDateIndex + swipeDirection * pointsToMove;
        const newIndex = Math.min(Math.max(targetIndex, 0), timelineDates.length - 1);
        
        // Ne mettre à jour que si l'index est différent
        if (newIndex !== currentDateIndex) {
          setCurrentDateIndex(newIndex);
          setCurrentDate(timelineDates[newIndex]);
          setLastProcessedIndex(newIndex);
        }
      }
      
      // Réinitialiser le décalage avec une animation douce
      const startTime = Date.now();
      const startOffset = dragOffset;
      const duration = 800; // Durée de l'animation de retour
      
      const animateToCenter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Utiliser une fonction d'easing douce
        const easeOutSextic = 1 - Math.pow(1 - progress, 6);
        
        const newOffset = startOffset * (1 - easeOutSextic);
        setDragOffset(newOffset);
        
        if (progress < 1) {
          requestAnimationFrame(animateToCenter);
        } else {
          setDragOffset(0);
        }
      };
      
      requestAnimationFrame(animateToCenter);
    }
  }, {
    axis: 'x',
    rubberband: true,
    filterTaps: true,
    bounds: { left: -2000, right: 2000 },
    threshold: 8 // Seuil légèrement plus élevé pour éviter les déplacements accidentels
  });

  return (
    <div className={`absolute top-8 left-[clamp(350px,calc(330px+3vw),410px)] 
      w-[calc(100%-clamp(370px,calc(350px+3vw),430px))] h-[150px] rounded-2xl 
      bg-gradient-to-r from-[rgba(71,154,243,0.5)] to-[rgba(71,154,243,0.1)] 
      backdrop-blur-[17.5px] flex flex-col items-center justify-center z-20 ${className}`}>
      <div className="relative w-full h-[120px] overflow-visible px-[2.5%]">
        {/* Timeline bar and points container */}
        <div className="absolute w-[calc(100%-120px)] top-[50px] left-0 flex justify-center">
          {/* Timeline bar */}
          <div className="absolute w-full h-1 bg-blue-500/30 rounded"></div>
          
          {/* Timeline progress */}
          <div 
            className="absolute h-1 bg-blue-500 rounded" 
            style={{ 
              width: `${(currentDateIndex / (timelineDates.length - 1)) * 100}%`,
              left: 0
            }}
          ></div>

          {/* Conteneur principal avec masque pour éviter les débordements */}
          <div className="absolute w-full h-[150px] top-[-45px] overflow-hidden">
            {/* Container avec overflow hidden */}
            <div 
              ref={containerRef}
              className="absolute cursor-grab active:cursor-grabbing left-1/2 -translate-x-1/2" 
              style={{ 
                height: '150px',
                width: '100%'
              }}
              {...bind()}
            >
              {/* Timeline points container with sliding effect */}
              <div 
                className="flex absolute transition-transform duration-800 ease-out"
                style={{ 
                  transform: `translateX(calc(-${currentDateIndex * 160}px + ${dragOffset}px))`,
                  width: `${timelineDates.length * 160}px`,
                  top: '45px',
                  left: '50%',
                  marginLeft: '-80px'
                }}
              >
                {/* Élément vide au début pour éviter la coupure du premier point */}
                <div className="flex-shrink-0 w-[80px]"></div>
                
                {timelineDates.map((date, index) => {
                  const hospital = getHospitalForDate(date);
                  
                  return (
                    <div 
                      key={date} 
                      className="flex-shrink-0 flex flex-col items-center w-[160px] relative"
                    >
                      {/* Deployment date */}
                      <div className={`text-[clamp(10px,0.8vw,12px)] text-white opacity-70 absolute -top-12 w-full text-center ${
                        index === currentDateIndex ? 'font-bold' : ''
                      }`}>
                        {format(new Date(date), 'dd/MM/yyyy')}
                      </div>

                      {/* Timeline point */}
                      <button
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center absolute 
                          ${index < currentDateIndex 
                            ? 'bg-blue-500 border-white' 
                            : index === currentDateIndex 
                              ? 'bg-blue-500 border-white scale-125' 
                              : 'bg-white border-blue-300'
                          }`}
                        style={{ top: '-16px' }}
                        onClick={() => handlePointClick(date, index)}
                      >
                        {index <= currentDateIndex && (
                          <svg className="w-full h-full p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </button>

                      {/* Hospital name */}
                      <div className={`text-[clamp(10px,0.8vw,12px)] leading-tight font-semibold text-white text-center absolute top-6
                        ${index === currentDateIndex ? 'font-bold text-[clamp(11px,0.9vw,13px)]' : 'opacity-70'}`}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3, // Réduit à 3 lignes
                          WebkitBoxOrient: 'vertical',
                          width: '130px',  // Largeur maintenue
                          left: '50%',
                          transform: 'translateX(-50%)',
                          maxHeight: '4.2em', // Hauteur réduite
                          padding: '0 2px', // Padding maintenu
                          wordBreak: 'break-word' // Césure des mots maintenue
                        }}
                      >
                        {hospital ? (
                          i18n.locale === 'fr' ? hospital.nameFr : hospital.nameEn
                        ) : ''}
                      </div>
                    </div>
                  );
                })}
                
                {/* Élément vide à la fin pour éviter la coupure du dernier point */}
                <div className="flex-shrink-0 w-[80px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skip button */}
        <button 
          className="absolute right-[20px] top-[34px]
            min-w-[100px] px-6 py-2 bg-[rgba(71,154,243,0.3)] text-[#A1CBF9] rounded-lg text-[clamp(12px,0.9vw,14px)]
            hover:bg-[rgba(71,154,243,0.4)] transition-colors duration-200 z-30
            border border-[rgba(71,154,243,0.3)] border-2"
          onClick={handleSkip}
        >
          {_('Skip')}
        </button>
      </div>
    </div>
  );
};

export default TimelineControl;