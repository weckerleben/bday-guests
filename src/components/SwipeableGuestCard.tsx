import { useState, useRef, ReactNode } from 'react';
import { Guest } from '../types';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface SwipeableGuestCardProps {
  guest: Guest;
  children: ReactNode;
  onConfirm?: (id: string) => void;
  onDecline?: (id: string) => void;
  className?: string;
}

const SWIPE_THRESHOLD = 60; // Distancia mínima en píxeles para considerar un swipe completado
const SWIPE_VELOCITY_THRESHOLD = 0.15; // Velocidad mínima para considerar un swipe rápido (muy reducido)
const HORIZONTAL_THRESHOLD = 10; // Distancia mínima horizontal para considerar movimiento horizontal (muy reducido)
const HORIZONTAL_RATIO = 1.1; // Ratio mínimo horizontal/vertical para considerar swipe horizontal (muy reducido)

export const SwipeableGuestCard = ({
  guest,
  children,
  onConfirm,
  onDecline,
  className = '',
}: SwipeableGuestCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Determinar qué acciones están disponibles
  const canConfirm = onConfirm && (guest.status === 'invited' || guest.status === 'confirmed');
  const canDecline = onDecline && (guest.status === 'invited' || guest.status === 'confirmed');

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isHorizontalSwipe.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determinar si es un movimiento principalmente horizontal o vertical
    if (isHorizontalSwipe.current === null) {
      // Si el movimiento horizontal es mayor que el vertical y tiene suficiente distancia, es un swipe horizontal
      // Usamos umbrales más permisivos para hacer el swipe más fácil de activar
      // También consideramos si el movimiento horizontal es significativo aunque el vertical también lo sea
      const isHorizontal = absX > absY * HORIZONTAL_RATIO && absX > HORIZONTAL_THRESHOLD;
      // También activar si el movimiento horizontal es suficientemente grande (más permisivo)
      const isSignificantHorizontal = absX > 25 && absX > absY;
      
      isHorizontalSwipe.current = isHorizontal || isSignificantHorizontal;
      
      // Si es vertical, no procesar y permitir scroll
      if (!isHorizontalSwipe.current) return;
    }
    
    // Si ya determinamos que es horizontal, procesar el swipe
    if (isHorizontalSwipe.current) {
      // Solo permitir swipe horizontal si hay acciones disponibles
      if (!canConfirm && deltaX > 0) {
        setTranslateX(0);
        return;
      }
      if (!canDecline && deltaX < 0) {
        setTranslateX(0);
        return;
      }

      setIsSwiping(true);
      setTranslateX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchStartTime.current === null) {
      setIsSwiping(false);
      isHorizontalSwipe.current = null;
      return;
    }

    // Solo procesar si fue un movimiento horizontal
    if (!isHorizontalSwipe.current) {
      setIsSwiping(false);
      isHorizontalSwipe.current = null;
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
      return;
    }

    const deltaX = translateX;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = deltaTime > 0 ? Math.abs(deltaX) / deltaTime : 0;

    // Determinar si es un swipe válido (umbrales más permisivos)
    // Aceptar si se supera la distancia mínima O si hay suficiente velocidad
    const isSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;

    if (isSwipe) {
      if (deltaX > 0 && canConfirm) {
        // Swipe a la derecha = confirmar
        onConfirm?.(guest.id);
      } else if (deltaX < 0 && canDecline) {
        // Swipe a la izquierda = declinar
        onDecline?.(guest.id);
      }
    }

    // Reset
    setTranslateX(0);
    setIsSwiping(false);
    isHorizontalSwipe.current = null;
    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
  };

  // Determinar el color de fondo y el ícono según la dirección del swipe
  const getSwipeAction = () => {
    if (!isSwiping || translateX === 0) return null;
    
    if (translateX > 0 && canConfirm) {
      // Swipe a la derecha (confirmar) - verde
      return {
        color: '#22c55e',
        icon: <CheckIcon style={{ fontSize: '2rem', color: '#ffffff' }} />,
      };
    } else if (translateX < 0 && canDecline) {
      // Swipe a la izquierda (declinar) - rojo
      return {
        color: '#ef4444',
        icon: <CloseIcon style={{ fontSize: '2rem', color: '#ffffff' }} />,
      };
    }
    
    return null;
  };

  const swipeAction = getSwipeAction();
  const swipeOpacity = swipeAction 
    ? Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1) 
    : 0;

  return (
    <div className={`swipeable-guest-card-wrapper ${className}`.trim()}>
      {/* Fondo con ícono (como en Gmail) */}
      {swipeAction && (
        <div
          className="swipe-action-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: swipeAction.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: translateX > 0 ? 'flex-start' : 'flex-end',
            paddingLeft: translateX > 0 ? '1.5rem' : '0',
            paddingRight: translateX > 0 ? '0' : '1.5rem',
            opacity: swipeOpacity,
            transition: isSwiping ? 'none' : 'opacity 0.3s ease-out',
            zIndex: 0,
          }}
        >
          {swipeAction.icon}
        </div>
      )}
      
      {/* Card movible */}
      <div
        ref={cardRef}
        className="swipeable-guest-card"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

