import { useState } from 'react';
import { Guest } from '../types';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { SwipeableGuestCard } from './SwipeableGuestCard';

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
  openCardId = null,
  onOpenCard,
  onCloseCard,
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

  const getSectionIcon = () => {
    if (title.includes('Invitados') && !title.includes('Confirmados') && !title.includes('Declinados')) {
      return <AccessTimeIcon className="section-icon section-icon-invited" />;
    }
    if (title.includes('Confirmados')) {
      return <CheckCircleIcon className="section-icon section-icon-confirmed" />;
    }
    if (title.includes('Declinados')) {
      return <CancelIcon className="section-icon section-icon-declined" />;
    }
    return null;
  };

  return (
    <div className={`card ${title.includes('Confirmados') ? 'card-section-confirmed' : ''}`}>
      <div className="card-header-section">
        {title && (
          <h2 className="card-title-section">
            {getSectionIcon()}
            <span>{title}</span>
            {!isEmpty && (
              <span className="card-title-count">
                {guests.length} {guests.length === 1 ? 'familia' : 'familias'} • {totalGuests} {totalGuests === 1 ? 'invitado' : 'invitados'}
              </span>
            )}
          </h2>
        )}
      </div>
      {headerAction && (
        <div style={{ marginBottom: '0.5rem' }}>
          {headerAction}
        </div>
      )}
      
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
          
          const cardContent = (
            <div 
              id={`guest-${guest.id}`}
              className={`guest-card guest-card-${guest.status} ${isHighlighted ? 'guest-highlighted' : ''}`}
            >
              <div className="guest-card-header">
                <div className="guest-card-title-row">
                  <h3>{guest.familyName}</h3>
                  <span className="guest-card-total-badge">{displayTotal} {displayTotal === 1 ? 'invitado' : 'invitados'}</span>
                </div>
              </div>
              <div className="guest-card-body">
                <div className="guest-card-chips">
                  <span className="guest-chip">
                    <PersonIcon className="guest-chip-icon" />
                    <span className="guest-chip-label">Adultos</span>
                    <span className="guest-chip-value">
                      {displayAdults}
                      {isPartial && displayAdults < guest.adults && (
                        <span className="guest-chip-partial">/{guest.adults}</span>
                      )}
                    </span>
                  </span>
                  <span className="guest-chip-separator">•</span>
                  <span className="guest-chip">
                    <GroupIcon className="guest-chip-icon" />
                    <span className="guest-chip-label">Niños</span>
                    <span className="guest-chip-value">
                      {displayChildren}
                      {isPartial && displayChildren < guest.children && (
                        <span className="guest-chip-partial">/{guest.children}</span>
                      )}
                    </span>
                  </span>
                  <span className="guest-chip-separator">•</span>
                  <span className="guest-chip">
                    <ChildCareIcon className="guest-chip-icon" />
                    <span className="guest-chip-label">Bebés</span>
                    <span className="guest-chip-value">
                      {displayBabies}
                      {isPartial && displayBabies < guest.babies && (
                        <span className="guest-chip-partial">/{guest.babies}</span>
                      )}
                    </span>
                  </span>
                </div>
              </div>
              {showActions && (
                <div className="guest-card-actions">
                  {onConfirm && guest.status === 'invited' && (
                    <button
                      className="button button-success button-compact"
                      onClick={() => onConfirm(guest.id)}
                      title="Confirmar"
                      aria-label="Confirmar invitación"
                    >
                      <CheckIcon />
                      <span>Confirmar</span>
                    </button>
                  )}
                  {onConfirm && guest.status === 'confirmed' && (
                    <button
                      className="button button-primary button-compact"
                      onClick={() => onConfirm(guest.id)}
                      title="Editar"
                      aria-label="Editar confirmación"
                    >
                      <EditIcon />
                      <span>Editar</span>
                    </button>
                  )}
                  {onDecline && (guest.status === 'invited' || guest.status === 'confirmed') && (
                    <button
                      className="button button-danger button-compact"
                      onClick={() => onDecline(guest.id)}
                      title="Declinar"
                      aria-label="Declinar invitación"
                    >
                      <CloseIcon />
                      <span>Declinar</span>
                    </button>
                  )}
                  {onCancelConfirmation && guest.status === 'confirmed' && (
                    <button
                      className="button button-secondary button-compact"
                      onClick={() => onCancelConfirmation(guest.id)}
                      title="Cancelar confirmación"
                      aria-label="Cancelar confirmación"
                    >
                      <UndoIcon />
                      <span>Cancelar</span>
                    </button>
                  )}
                  {onReinvite && guest.status === 'declined' && (
                    <button
                      className="button button-success button-compact"
                      onClick={() => onReinvite(guest.id)}
                      title="Reinvitar"
                      aria-label="Reinvitar"
                    >
                      <CheckIcon />
                      <span>Reinvitar</span>
                    </button>
                  )}
                  {onDelete && baseGuestIds && !baseGuestIds.has(guest.id) && (
                    <button
                      className="button button-danger button-compact"
                      onClick={() => onDelete(guest.id)}
                      title="Eliminar"
                      aria-label="Eliminar invitado"
                    >
                      <DeleteIcon />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );

          return (
            <SwipeableGuestCard
              key={guest.id}
              guest={guest}
              onConfirm={onConfirm}
              onDecline={onDecline}
              onReinvite={onReinvite}
              onCancelConfirmation={onCancelConfirmation}
              onDelete={onDelete}
              baseGuestIds={baseGuestIds}
              isOpen={openCardId === guest.id}
              onOpen={onOpenCard}
              onClose={onCloseCard}
            >
              {cardContent}
            </SwipeableGuestCard>
          );
        })}
      </div>
      )}
    </div>
  );
};
