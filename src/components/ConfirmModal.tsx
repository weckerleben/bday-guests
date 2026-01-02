import { useState, useEffect } from 'react';
import { Guest } from '../types';

interface ConfirmModalProps {
  guest: Guest;
  onConfirm: (confirmedAdults: number, confirmedChildren: number, confirmedBabies: number) => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ guest, onConfirm, onCancel }: ConfirmModalProps) => {
  const [confirmedAdults, setConfirmedAdults] = useState(guest.confirmedAdults ?? guest.adults);
  const [confirmedChildren, setConfirmedChildren] = useState(guest.confirmedChildren ?? guest.children);
  const [confirmedBabies, setConfirmedBabies] = useState(guest.confirmedBabies ?? guest.babies);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setConfirmedAdults(guest.confirmedAdults ?? guest.adults);
    setConfirmedChildren(guest.confirmedChildren ?? guest.children);
    setConfirmedBabies(guest.confirmedBabies ?? guest.babies);
    setError(''); // Limpiar error al cambiar de invitado
  }, [guest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (confirmedAdults === 0 && confirmedChildren === 0 && confirmedBabies === 0) {
      setError('Debes confirmar al menos una persona');
      return;
    }

    if (confirmedAdults > guest.adults || confirmedChildren > guest.children || confirmedBabies > guest.babies) {
      setError('No puedes confirmar más personas de las que fueron invitadas');
      return;
    }

    onConfirm(confirmedAdults, confirmedChildren, confirmedBabies);
  };

  const handleConfirmAll = () => {
    setConfirmedAdults(guest.adults);
    setConfirmedChildren(guest.children);
    setConfirmedBabies(guest.babies);
  };

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
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          maxWidth: '500px',
          width: '90%',
          margin: '0 auto',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Confirmar: {guest.familyName}</h2>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Invitados: {guest.adults} adultos, {guest.children} niños, {guest.babies} bebés
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#991b1b',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="confirmed-adults">
              Adultos confirmados (máx: {guest.adults})
            </label>
            <input
              id="confirmed-adults"
              type="number"
              min="0"
              max={guest.adults}
              value={confirmedAdults}
              onChange={(e) => {
                setConfirmedAdults(Math.min(parseInt(e.target.value) || 0, guest.adults));
                setError('');
              }}
              required
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmed-children">
              Niños confirmados (máx: {guest.children})
            </label>
            <input
              id="confirmed-children"
              type="number"
              min="0"
              max={guest.children}
              value={confirmedChildren}
              onChange={(e) => {
                setConfirmedChildren(Math.min(parseInt(e.target.value) || 0, guest.children));
                setError('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmed-babies">
              Bebés confirmados (máx: {guest.babies})
            </label>
            <input
              id="confirmed-babies"
              type="number"
              min="0"
              max={guest.babies}
              value={confirmedBabies}
              onChange={(e) => {
                setConfirmedBabies(Math.min(parseInt(e.target.value) || 0, guest.babies));
                setError('');
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={handleConfirmAll}
            >
              Confirmar Todos
            </button>
          </div>

          <div className="actions">
            <button type="submit" className="button button-success">
              Confirmar
            </button>
            <button type="button" className="button button-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
