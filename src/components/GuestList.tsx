import { Guest } from '../types';

// Íconos SVG inline
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 2.5L13.5 4.5L5.5 12.5H3.5V10.5L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8C3 5.5 5 3.5 7.5 3.5C10 3.5 12 5.5 12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 5L7.5 3.5L6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface GuestListProps {
  title: string;
  guests: Guest[];
  highlightedGuestId?: string | null;
  onConfirm?: (id: string) => void;
  onDecline?: (id: string) => void;
  onReinvite?: (id: string) => void;
  onCancelConfirmation?: (id: string) => void;
  showActions: boolean;
}

export const GuestList = ({
  title,
  guests,
  highlightedGuestId,
  onConfirm,
  onDecline,
  onReinvite,
  onCancelConfirmation,
  showActions,
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
      <h2>
        {title} {!isEmpty && `(${guests.length} ${guests.length === 1 ? 'familia' : 'familias'} - ${totalGuests} ${totalGuests === 1 ? 'invitado' : 'invitados'})`}
      </h2>
      
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
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {guest.adults}</span>
                    )}
                  </td>
                  <td>
                    {displayChildren}
                    {isPartial && displayChildren < guest.children && (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {guest.children}</span>
                    )}
                  </td>
                  <td>
                    {displayBabies}
                    {isPartial && displayBabies < guest.babies && (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {guest.babies}</span>
                    )}
                  </td>
                  <td>
                    {displayTotal}
                    {isPartial && displayTotal < total && (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {total}</span>
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
                            <XIcon />
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
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {guest.adults}</span>
                    )}
                  </span>
                </div>
                <div className="guest-card-row">
                  <span className="guest-card-label">Niños:</span>
                  <span className="guest-card-value">
                    {displayChildren}
                    {isPartial && displayChildren < guest.children && (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {guest.children}</span>
                    )}
                  </span>
                </div>
                <div className="guest-card-row">
                  <span className="guest-card-label">Bebés:</span>
                  <span className="guest-card-value">
                    {displayBabies}
                    {isPartial && displayBabies < guest.babies && (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {guest.babies}</span>
                    )}
                  </span>
                </div>
                <div className="guest-card-row" style={{ fontWeight: 'bold', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <span className="guest-card-label">Total:</span>
                  <span className="guest-card-value">
                    {displayTotal}
                    {isPartial && displayTotal < total && (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}> / {total}</span>
                    )}
                  </span>
                </div>
              </div>
              {showActions && (
                <div className="guest-card-actions">
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
                      <XIcon />
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
