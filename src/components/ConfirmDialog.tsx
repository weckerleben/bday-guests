interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
}: ConfirmDialogProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          maxWidth: '400px',
          width: '90%',
          margin: '0 auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '0.75rem' }}>{title}</h2>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>{message}</p>
        <div className="actions">
          <button
            type="button"
            className={`button ${variant === 'danger' ? 'button-danger' : 'button-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button type="button" className="button button-secondary" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

