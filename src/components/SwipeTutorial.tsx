import { useState, useEffect } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

interface SwipeTutorialProps {
  show?: boolean;
}

export const SwipeTutorial = ({ show = false }: SwipeTutorialProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animationStep, setAnimationStep] = useState<'reveal' | 'idle'>('idle');

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

    // Mostrar tutorial solo si show es true y es móvil
    if (show && window.innerWidth <= 768) {
      // Esperar un poco para que la página cargue completamente
      const timer = setTimeout(() => {
        setShowTutorial(true);
        // Iniciar animación después de un breve delay
        setTimeout(() => {
          setAnimationStep('reveal');
        }, 500);
      }, 1000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkMobile);
      };
    } else {
      setShowTutorial(false);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [show]);

  useEffect(() => {
    if (!showTutorial) return;

    // Animación de revelar acciones
    if (animationStep === 'reveal') {
      const timer = setTimeout(() => {
        setAnimationStep('idle');
        // Después de mostrar la animación, cerrar el tutorial
        setTimeout(() => {
          handleClose();
        }, 1000);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [animationStep, showTutorial]);

  const handleClose = () => {
    setShowTutorial(false);
  };

  if (!showTutorial || !isMobile) return null;

  const translateX = animationStep === 'reveal' ? 128 : 0; // 128px = 2 botones de 64px
  const revealProgress = animationStep === 'reveal' ? 1 : 0;

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
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          Desliza para ver acciones
        </h2>
        <p style={{ marginBottom: '2rem', opacity: 0.9, fontSize: '0.95rem' }}>
          Desliza la card hacia la derecha para ver las acciones disponibles
        </p>

        {/* Card de ejemplo con animación */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto',
            overflow: 'visible',
            borderRadius: '0',
          }}
        >
          {/* Botones de acción que aparecen */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'row',
              opacity: revealProgress,
              transition: 'opacity 0.3s ease',
              zIndex: 0,
            }}
          >
            <button
              style={{
                width: '64px',
                height: '100%',
                backgroundColor: '#10b981',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0',
              }}
            >
              <CheckIcon style={{ fontSize: '1.5rem', color: '#ffffff' }} />
            </button>
            <button
              style={{
                width: '64px',
                height: '100%',
                backgroundColor: '#ef4444',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0',
              }}
            >
              <DeleteIcon style={{ fontSize: '1.5rem', color: '#ffffff' }} />
            </button>
          </div>

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
                background: 'white',
                border: 'none',
                borderBottom: '1px solid #e5e7eb',
                borderRadius: '0',
                padding: '0.875rem 1rem',
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                  Ejemplo de Familia
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ color: '#6b7280' }}>👤</span>
                <span style={{ color: '#1f2937', fontWeight: 500 }}>2</span>
                <span style={{ color: '#e5e7eb', margin: '0 0.125rem' }}>·</span>
                <span style={{ color: '#6b7280' }}>👥</span>
                <span style={{ color: '#1f2937', fontWeight: 500 }}>1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

