import { useState, useRef, ReactNode, useEffect } from 'react';
import { Guest } from '../types';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';

interface SwipeableGuestCardProps {
  guest: Guest;
  children: ReactNode;
  onConfirm?: (id: string) => void;
  onDecline?: (id: string) => void;
  onReinvite?: (id: string) => void;
  onCancelConfirmation?: (id: string) => void;
  onDelete?: (id: string) => void;
  baseGuestIds?: Set<string>;
  className?: string;
  isOpen?: boolean;
  onOpen?: (id: string) => void;
  onClose?: () => void;
}

const SWIPE_THRESHOLD = 50; // Distancia mínima para considerar swipe válido
const SWIPE_VELOCITY_THRESHOLD = 0.15;
const HORIZONTAL_THRESHOLD = 10;
const HORIZONTAL_RATIO = 1.1;
const BUTTON_WIDTH = 64; // Ancho de cada botón en píxeles

export const SwipeableGuestCard = ({
  guest,
  children,
  onConfirm,
  onDecline,
  onReinvite,
  onCancelConfirmation,
  onDelete,
  baseGuestIds,
  className = '',
  isOpen = false,
  onOpen,
  onClose,
}: SwipeableGuestCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastDirection = useRef<'left' | 'right' | null>(null);
  const translateXRef = useRef(0);

  // Sincronizar con estado externo (isOpen)
  useEffect(() => {
    if (!isOpen) {
      translateXRef.current = 0;
      setTranslateX(0);
      lastDirection.current = null;
    }
  }, [isOpen]);

  // Determinar acciones disponibles según estado
  const getLeftActions = () => {
    const actions = [];
    if (guest.status === 'invited' && onConfirm) {
      actions.push({
        icon: <CheckIcon />,
        label: 'Confirmar',
        action: () => onConfirm(guest.id),
        color: '#10b981',
      });
    } else if (guest.status === 'confirmed' && onConfirm) {
      actions.push({
        icon: <EditIcon />,
        label: 'Editar',
        action: () => onConfirm(guest.id),
        color: '#667eea',
      });
    } else if (guest.status === 'declined' && onReinvite) {
      actions.push({
        icon: <CheckIcon />,
        label: 'Reinvitar',
        action: () => onReinvite(guest.id),
        color: '#10b981',
      });
    }
    return actions;
  };

  const getRightActions = () => {
    const actions = [];
    if ((guest.status === 'invited' || guest.status === 'confirmed') && onDecline) {
      actions.push({
        icon: <CloseIcon />,
        label: 'Declinar',
        action: () => onDecline(guest.id),
        color: '#ef4444',
      });
    }
    if (guest.status === 'confirmed' && onCancelConfirmation) {
      actions.push({
        icon: <UndoIcon />,
        label: 'Cancelar',
        action: () => onCancelConfirmation(guest.id),
        color: '#6b7280',
      });
    }
    if (onDelete && baseGuestIds && !baseGuestIds.has(guest.id)) {
      actions.push({
        icon: <DeleteIcon />,
        label: 'Eliminar',
        action: () => onDelete(guest.id),
        color: '#ef4444',
      });
    }
    return actions;
  };

  const leftActions = getLeftActions();
  const rightActions = getRightActions();

  // En WhatsApp, todas las acciones están en el lado izquierdo cuando deslizas a la derecha
  // Combinamos todas las acciones disponibles en un solo array
  const allActions = [...leftActions, ...rightActions];

  // Agregar event listeners manualmente con { passive: false } para touchmove
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const touchStartHandler = (e: TouchEvent) => {
      // Cerrar otras cards si hay una abierta
      if (onClose && !isOpen) {
        onClose();
      }
      
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchStartTime.current = Date.now();
      isHorizontalSwipe.current = null;
      lastDirection.current = null;
    };

    const touchMoveHandler = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (isHorizontalSwipe.current === null) {
        const isHorizontal = absX > absY * HORIZONTAL_RATIO && absX > HORIZONTAL_THRESHOLD;
        const isSignificantHorizontal = absX > 25 && absX > absY;
        isHorizontalSwipe.current = isHorizontal || isSignificantHorizontal;
        
        if (!isHorizontalSwipe.current) return;
      }
      
      if (isHorizontalSwipe.current) {
        e.preventDefault(); // Ahora funciona porque el listener no es pasivo
        
        // Calcular el espacio necesario según la cantidad de botones
        const revealThreshold = allActions.length * BUTTON_WIDTH;
        
        // Limitar el swipe según las acciones disponibles
        const maxRight = allActions.length > 0 ? revealThreshold : 0;
        
        let clampedX = deltaX;
        if (deltaX > 0 && deltaX > maxRight) {
          clampedX = maxRight;
          lastDirection.current = 'right';
        } else if (deltaX < 0) {
          clampedX = 0;
          lastDirection.current = null;
        } else {
          if (deltaX > 0) lastDirection.current = 'right';
        }

        setIsSwiping(true);
        translateXRef.current = clampedX;
        setTranslateX(clampedX);
      }
    };

    const touchEndHandler = () => {
      if (touchStartX.current === null || touchStartTime.current === null) {
        setIsSwiping(false);
        isHorizontalSwipe.current = null;
        return;
      }

      if (!isHorizontalSwipe.current) {
        setIsSwiping(false);
        isHorizontalSwipe.current = null;
        touchStartX.current = null;
        touchStartY.current = null;
        touchStartTime.current = null;
        return;
      }

      const deltaX = translateXRef.current;
      const deltaTime = Date.now() - touchStartTime.current;
      const velocity = deltaTime > 0 ? Math.abs(deltaX) / deltaTime : 0;
      const isSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;

      // Calcular el espacio necesario según la cantidad de botones
      const revealThreshold = allActions.length * BUTTON_WIDTH;

      if (!isSwipe) {
        translateXRef.current = 0;
        setTranslateX(0);
        if (onClose) onClose();
      } else {
        if (deltaX > 0 && allActions.length > 0) {
          translateXRef.current = revealThreshold;
          setTranslateX(revealThreshold);
          if (onOpen) onOpen(guest.id);
        } else {
          translateXRef.current = 0;
          setTranslateX(0);
          if (onClose) onClose();
        }
      }

      setIsSwiping(false);
      isHorizontalSwipe.current = null;
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
    };

    element.addEventListener('touchstart', touchStartHandler, { passive: true });
    element.addEventListener('touchmove', touchMoveHandler, { passive: false });
    element.addEventListener('touchend', touchEndHandler, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
    };
  }, [allActions.length, guest.id, isOpen, onClose, onOpen]);

  const handleActionClick = (action: () => void, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    action();
    setTranslateX(0); // Cerrar después de la acción
    if (onClose) onClose();
  };

  // Calcular el espacio necesario según la cantidad de botones
  const revealThreshold = allActions.length * BUTTON_WIDTH;
  const revealProgress = revealThreshold > 0 ? Math.min(Math.abs(translateX) / revealThreshold, 1) : 0;
  // En WhatsApp: deslizar a la DERECHA (translateX > 0) muestra todas las acciones a la IZQUIERDA
  const showingActions = translateX > 0 && allActions.length > 0;

  return (
    <div className={`swipeable-guest-card-wrapper ${className}`.trim()}>
      {/* Todas las acciones en el lado izquierdo (estilo WhatsApp) */}
      {allActions.length > 0 && (
        <div 
          className="swipe-action-left"
          style={{
            opacity: showingActions ? revealProgress : 0,
            pointerEvents: showingActions ? 'auto' : 'none',
          }}
        >
          {allActions.map((action, index) => (
            <button
              key={index}
              className="swipe-action-button"
              onClick={(e) => handleActionClick(action.action, e)}
              onTouchEnd={(e) => handleActionClick(action.action, e)}
              style={{ backgroundColor: action.color }}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
      
      {/* Card movible */}
      <div
        ref={cardRef}
        className="swipeable-guest-card"
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
