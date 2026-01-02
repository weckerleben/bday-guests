import { Guest } from '../types';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';

interface GuestListProps {
  title: string;
  guests: Guest[];
  highlightedGuestId?: string | null;
  baseGuestIds?: Set<string>; // IDs de invitados base (no se pueden eliminar)
  onConfirm?: (id: string) => void;
  onDecline?: (id: string) => void;
  onReinvite?: (id: string) => void;
  onCancelConfirmation?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions: boolean;
  headerAction?: React.ReactNode; // Contenido adicional para el header (ej: botones)
}

export const GuestList = ({
  title,
  guests,
  highlightedGuestId,
  baseGuestIds,
  onConfirm,
  onDecline,
  onReinvite,
  onCancelConfirmation,
  onDelete,
  showActions,
  headerAction,
}: GuestListProps) => {
  const isEmpty = guests.length === 0;

  const totalGuests = guests.reduce(
    (sum, guest) => sum + guest.adults + guest.children + guest.babies,
    0
  );

  const getEmptyMessage = () => {
    if (title.includes('Invitados') && !title.includes('Confirmados') && !title.includes('Declinados')) {
      return 'No hay invitados pendientes';
    }
    if (title.includes('Confirmados')) {
      return 'Aún no hay invitados confirmados';
    }
    if (title.includes('Declinados')) {
      return 'No hay invitados declinados';
    }
    return 'No hay elementos';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: title ? '1rem' : '0', flexWrap: 'wrap', gap: '0.75rem' }}>
        {title && (
          <h2 style={{ flex: '1 1 auto', margin: 0 }}>
            {title} {!isEmpty && `(${guests.length} ${guests.length === 1 ? 'familia' : 'familias'} - ${totalGuests} ${totalGuests === 1 ? 'invitado' : 'invitados'})`}
          </h2>
        )}
        {headerAction && (
          <div style={{ flex: '0 0 auto' }}>
            {headerAction}
          </div>
        )}
      </div>
      
      {isEmpty && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic',
        }}>
          {getEmptyMessage()}
        </div>
      )}
      
      {/* Tabla para desktop */}
      {!isEmpty && (
      <div className="guest-table-desktop">
        <table className="table">
          <thead>
            <tr>
              <th>Familia/Grupo</th>
              <th>Adultos</th>
              <th>Niños</th>
              <th>Bebés</th>
              <th>Total</th>
              {showActions && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => {
              const total = guest.adults + guest.children + guest.babies;
              const displayAdults = guest.status === 'confirmed' && guest.confirmedAdults !== undefined 
                ? guest.confirmedAdults 
                : guest.adults;
              const displayChildren = guest.status === 'confirmed' && guest.confirmedChildren !== undefined 
                ? guest.confirmedChildren 
                : guest.children;
              const displayBabies = guest.status === 'confirmed' && guest.confirmedBabies !== undefined 
                ? guest.confirmedBabies 
                : guest.babies;
              const displayTotal = displayAdults + displayChildren + displayBabies;
              
              const isPartial = guest.status === 'confirmed' && 
                (displayAdults < guest.adults || displayChildren < guest.children || displayBabies < guest.babies);
              
              const isHighlighted = highlightedGuestId === guest.id;
              
              return (
                <tr 
                  key={guest.id} 
                  id={`guest-${guest.id}`}
                  className={isHighlighted ? 'guest-highlighted' : ''}
                >
                  <td>{guest.familyName}</td>
                  <td>
                    {displayAdults}
                    {isPartial && displayAdults < guest.adults && (
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> / {guest.adults}</span>
                    )}
                  </td>
                  <td>
                    {displayChildren}
                    {isPartial && displayChildren < guest.children && (
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> / {guest.children}</span>
                    )}
                  </td>
                  <td>
                    {displayBabies}
                    {isPartial && displayBabies < guest.babies && (
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> / {guest.babies}</span>
                    )}
                  </td>
                  <td>
                    {displayTotal}
                    {isPartial && displayTotal < total && (
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> / {total}</span>
                    )}
                  </td>
                  {showActions && (
                    <td>
                      <div className="actions">
                        {onConfirm && guest.status === 'invited' && (
                          <button
                            className="button button-success button-small button-icon"
                            onClick={() => onConfirm(guest.id)}
                            title="Confirmar"
                            aria-label="Confirmar invitación"
                          >
                            <CheckIcon />
                          </button>
                        )}
                        {onConfirm && guest.status === 'confirmed' && (
                          <button
                            className="button button-primary button-small button-icon"
                            onClick={() => onConfirm(guest.id)}
                            title="Editar"
                            aria-label="Editar confirmación"
                          >
                            <EditIcon />
                          </button>
                        )}
                        {onDecline && (guest.status === 'invited' || guest.status === 'confirmed') && (
                          <button
                            className="button button-danger button-small button-icon"
                            onClick={() => onDecline(guest.id)}
                            title="Declinar"
                            aria-label="Declinar invitación"
                          >
                            <CloseIcon />
                          </button>
                        )}
                        {onCancelConfirmation && guest.status === 'confirmed' && (
                          <button
                            className="button button-secondary button-small button-icon"
                            onClick={() => onCancelConfirmation(guest.id)}
                            title="Cancelar confirmación"
                            aria-label="Cancelar confirmación"
                          >
                            <UndoIcon />
                          </button>
                        )}
                        {onReinvite && guest.status === 'declined' && (
                          <button
                            className="button button-success button-small button-icon"
                            onClick={() => onReinvite(guest.id)}
                            title="Reinvitar"
                            aria-label="Reinvitar"
                          >
                            <CheckIcon />
                          </button>
                        )}
                        {onDelete && baseGuestIds && !baseGuestIds.has(guest.id) && (
                          <button
                            className="button button-danger button-small button-icon"
                            onClick={() => onDelete(guest.id)}
                            title="Eliminar"
                            aria-label="Eliminar invitado"
                          >
                            <DeleteIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
      </div>
      )}

      {/* Cards para móvil */}
      {!isEmpty && (
      <div className="guest-cards-mobile">
        {guests.map((guest) => {
          const total = guest.adults + guest.children + guest.babies;
          const displayAdults = guest.status === 'confirmed' && guest.confirmedAdults !== undefined 
            ? guest.confirmedAdults 
            : guest.adults;
          const displayChildren = guest.status === 'confirmed' && guest.confirmedChildren !== undefined 
            ? guest.confirmedChildren 
            : guest.children;
          const displayBabies = guest.status === 'confirmed' && guest.confirmedBabies !== undefined 
            ? guest.confirmedBabies 
            : guest.babies;
          const displayTotal = displayAdults + displayChildren + displayBabies;
          
          const isPartial = guest.status === 'confirmed' && 
            (displayAdults < guest.adults || displayChildren < guest.children || displayBabies < guest.babies);
          
          const isHighlighted = highlightedGuestId === guest.id;
          
          return (
            <div 
              key={guest.id} 
              id={`guest-${guest.id}`}
              className={`guest-card ${isHighlighted ? 'guest-highlighted' : ''}`}
            >
              <div className="guest-card-header">
                <h3>{guest.familyName}</h3>
              </div>
              <div className="guest-card-body">
                <div className="guest-card-row">
                  <span className="guest-card-label">Adultos:</span>
                  <span className="guest-card-value">
                    {displayAdults}
                    {isPartial && displayAdults < guest.adults && (
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> / {guest.adults}</span>
                    )}
                  </span>
                </div>
                <div className="guest-card-row">
                  <span className="guest-card-label">Niños:</span>
                  <span className="guest-card-value">
                    {displayChildren}
                    {isPartial && displayChildren < guest.children && (
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> / {guest.children}</span>
                    )}
                  </span>
                </div>
                <div className="guest-card-row">
                  <span className="guest-card-label">Bebés:</span>
                  <span className="guest-card-value">
                    {displayBabies}
                    {isPartial && displayBabies < guest.babies && (
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}> / {guest.babies}</span>
                    )}
                  </span>
                </div>
                <div className="guest-card-row" style={{ fontWeight: 'bold', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid #e5e7eb', fontSize: '0.9rem' }}>
                  <span className="guest-card-label">Total:</span>
                  <span className="guest-card-value">
                    {displayTotal}
                    {isPartial && displayTotal < total && (
                      <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> / {total}</span>
                    )}
                  </span>
                </div>
              </div>
              {showActions && (
                <div className="guest-card-actions">
                  {onConfirm && guest.status === 'invited' && (
                    <button
                      className="button button-success button-small button-icon button-with-text"
                      onClick={() => onConfirm(guest.id)}
                      title="Confirmar"
                      aria-label="Confirmar invitación"
                    >
                      <CheckIcon />
                      <span className="button-text">Confirmar</span>
                    </button>
                  )}
                  {onConfirm && guest.status === 'confirmed' && (
                    <button
                      className="button button-primary button-small button-icon button-with-text"
                      onClick={() => onConfirm(guest.id)}
                      title="Editar"
                      aria-label="Editar confirmación"
                    >
                      <EditIcon />
                      <span className="button-text">Editar</span>
                    </button>
                  )}
                  {onDecline && (guest.status === 'invited' || guest.status === 'confirmed') && (
                    <button
                      className="button button-danger button-small button-icon button-with-text"
                      onClick={() => onDecline(guest.id)}
                      title="Declinar"
                      aria-label="Declinar invitación"
                    >
                      <CloseIcon />
                      <span className="button-text">Declinar</span>
                    </button>
                  )}
                  {onCancelConfirmation && guest.status === 'confirmed' && (
                    <button
                      className="button button-secondary button-small button-icon button-with-text"
                      onClick={() => onCancelConfirmation(guest.id)}
                      title="Cancelar confirmación"
                      aria-label="Cancelar confirmación"
                    >
                      <UndoIcon />
                      <span className="button-text">Cancelar</span>
                    </button>
                  )}
                  {onReinvite && guest.status === 'declined' && (
                    <button
                      className="button button-success button-small button-icon button-with-text"
                      onClick={() => onReinvite(guest.id)}
                      title="Reinvitar"
                      aria-label="Reinvitar"
                    >
                      <CheckIcon />
                      <span className="button-text">Reinvitar</span>
                    </button>
                  )}
                  {onDelete && baseGuestIds && !baseGuestIds.has(guest.id) && (
                    <button
                      className="button button-danger button-small button-icon button-with-text"
                      onClick={() => onDelete(guest.id)}
                      title="Eliminar"
                      aria-label="Eliminar invitado"
                    >
                      <DeleteIcon />
                      <span className="button-text">Eliminar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
