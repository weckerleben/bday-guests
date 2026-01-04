import { useState, useEffect } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export const SwipeTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animationStep, setAnimationStep] = useState<'right' | 'left' | 'idle'>('idle');

  useEffect(() => {
    // Verificar si es móvil
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Si cambia a no móvil, ocultar el tutorial
      if (!mobile) {
        setShowTutorial(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Mostrar tutorial cada vez que se carga la página en móvil
    if (window.innerWidth <= 768) {
      // Esperar un poco para que la página cargue completamente
      const timer = setTimeout(() => {
        setShowTutorial(true);
        // Iniciar animación después de un breve delay
        setTimeout(() => {
          setAnimationStep('right');
        }, 500);
      }, 1000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkMobile);
      };
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!showTutorial) return;

    // Animación de swipe a la derecha
    if (animationStep === 'right') {
      const timer = setTimeout(() => {
        setAnimationStep('idle');
        // Después de un momento, mostrar swipe a la izquierda
        setTimeout(() => {
          setAnimationStep('left');
        }, 800);
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Animación de swipe a la izquierda
    if (animationStep === 'left') {
      const timer = setTimeout(() => {
        setAnimationStep('idle');
        // Después de mostrar ambas animaciones, cerrar el tutorial
        setTimeout(() => {
          handleClose();
        }, 1000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [animationStep, showTutorial]);

  const handleClose = () => {
    setShowTutorial(false);
  };

  if (!showTutorial || !isMobile) return null;

  const translateX = animationStep === 'right' ? 100 : animationStep === 'left' ? -100 : 0;
  const bgColor = animationStep === 'right' ? '#22c55e' : animationStep === 'left' ? '#ef4444' : 'transparent';
  const icon = animationStep === 'right' ? (
    <CheckIcon style={{ fontSize: '2rem', color: '#ffffff' }} />
  ) : animationStep === 'left' ? (
    <CloseIcon style={{ fontSize: '2rem', color: '#ffffff' }} />
  ) : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          color: 'white',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          Desliza para confirmar o declinar
        </h2>
        <p style={{ marginBottom: '2rem', opacity: 0.9, fontSize: '0.95rem' }}>
          Desliza la card hacia la derecha para confirmar o hacia la izquierda para declinar
        </p>

        {/* Card de ejemplo con animación */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto',
            overflow: 'hidden',
            borderRadius: '8px',
          }}
        >
          {/* Fondo con ícono */}
          {icon && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: animationStep === 'right' ? 'flex-start' : 'flex-end',
                paddingLeft: animationStep === 'right' ? '1.5rem' : '0',
                paddingRight: animationStep === 'right' ? '0' : '1.5rem',
                opacity: Math.abs(translateX) / 100,
                zIndex: 0,
              }}
            >
              {icon}
            </div>
          )}

          {/* Card movible */}
          <div
            style={{
              position: 'relative',
              transform: `translateX(${translateX}px)`,
              transition: 'transform 1.5s ease-in-out',
              zIndex: 1,
            }}
          >
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                  Ejemplo de Familia
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#6b7280' }}>Adultos:</span>
                  <span style={{ color: '#111827' }}>2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#6b7280' }}>Niños:</span>
                  <span style={{ color: '#111827' }}>1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

