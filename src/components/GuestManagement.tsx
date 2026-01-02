import { useState, useEffect, useRef } from 'react';
import { Guest } from '../types';
import { GuestList } from './GuestList';
import { ConfirmModal } from './ConfirmModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';

interface GuestManagementProps {
  guests: Guest[];
  onGuestsChange: (guests: Guest[]) => void;
}

export const GuestManagement = ({ guests, onGuestsChange }: GuestManagementProps) => {
  const [confirmingGuest, setConfirmingGuest] = useState<Guest | null>(null);
  const [decliningGuestId, setDecliningGuestId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [highlightedGuestId, setHighlightedGuestId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  // Efecto para hacer scroll y highlight después de que React re-renderice
  useEffect(() => {
    if (highlightedGuestId) {
      // Esperar a que React termine de renderizar
      const timer = setTimeout(() => {
        const element = document.getElementById(`guest-${highlightedGuestId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
      
      // Limpiar highlight después de 2 segundos
      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedGuestId(null);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
      };
    }
  }, [highlightedGuestId, guests]);

  const handleUpdate = async (id: string, updates: Partial<Guest>) => {
    await onGuestsChange(
      guests.map((guest) => (guest.id === id ? { ...guest, ...updates } : guest))
    );
  };

  const handleConfirm = (guest: Guest) => {
    setConfirmingGuest(guest);
  };

  const handleConfirmSubmit = async (
    confirmedAdults: number,
    confirmedChildren: number,
    confirmedBabies: number
  ) => {
    if (confirmingGuest) {
      const wasInvited = confirmingGuest.status === 'invited';
      const guestId = confirmingGuest.id;
      
      await handleUpdate(guestId, {
        status: 'confirmed',
        confirmedAdults,
        confirmedChildren,
        confirmedBabies,
      });
      
      setConfirmingGuest(null);
      
      // Highlight se maneja en el useEffect después del re-render
      setHighlightedGuestId(guestId);
      
      setToast({ 
        message: wasInvited 
          ? `✓ ${confirmingGuest.familyName} confirmado` 
          : `✓ Confirmación de ${confirmingGuest.familyName} actualizada`,
        type: 'success' 
      });
    }
  };

  const handleDecline = (id: string) => {
    setDecliningGuestId(id);
  };

  const confirmDecline = async () => {
    if (decliningGuestId) {
      const guest = guests.find((g) => g.id === decliningGuestId);
      const guestId = decliningGuestId;
      
      await handleUpdate(guestId, { status: 'declined' });
      setDecliningGuestId(null);
      
      // Highlight se maneja en el useEffect después del re-render
      setHighlightedGuestId(guestId);
      
      if (guest) {
        setToast({ 
          message: `✗ ${guest.familyName} declinado`,
          type: 'info' 
        });
      }
    }
  };

  const handleReinvite = async (id: string) => {
    const guest = guests.find((g) => g.id === id);
    
    await handleUpdate(id, { status: 'invited' });
    
    // Highlight se maneja en el useEffect después del re-render
    setHighlightedGuestId(id);
    
    if (guest) {
      setToast({ 
        message: `✓ ${guest.familyName} reinvitado`,
        type: 'success' 
      });
    }
  };

  const handleCancelConfirmation = async (id: string) => {
    const guest = guests.find((g) => g.id === id);
    
    await handleUpdate(id, { 
      status: 'invited',
      confirmedAdults: undefined,
      confirmedChildren: undefined,
      confirmedBabies: undefined,
    });
    
    // Highlight se maneja en el useEffect después del re-render
    setHighlightedGuestId(id);
    
    if (guest) {
      setToast({ 
        message: `↶ Confirmación de ${guest.familyName} cancelada`,
        type: 'info' 
      });
    }
  };

  const invitedGuests = guests.filter((g) => g.status === 'invited');
  const confirmedGuests = guests.filter((g) => g.status === 'confirmed');
  const declinedGuests = guests.filter((g) => g.status === 'declined');

  const decliningGuest = decliningGuestId ? guests.find((g) => g.id === decliningGuestId) : null;

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {confirmingGuest && (
        <ConfirmModal
          guest={confirmingGuest}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmingGuest(null)}
        />
      )}

      {decliningGuest && (
        <ConfirmDialog
          title="Declinar Invitación"
          message={`¿Estás seguro de que ${decliningGuest.familyName} declinará la invitación?`}
          onConfirm={confirmDecline}
          onCancel={() => setDecliningGuestId(null)}
          confirmText="Sí, Declinar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}

      <div className="guests-grid">
        <GuestList
          title="Invitados"
          guests={invitedGuests}
          highlightedGuestId={highlightedGuestId}
          onConfirm={(id) => {
            const guest = guests.find((g) => g.id === id);
            if (guest) handleConfirm(guest);
          }}
          onDecline={handleDecline}
          showActions={true}
        />

        <GuestList
          title="Confirmados"
          guests={confirmedGuests}
          highlightedGuestId={highlightedGuestId}
          onConfirm={(id) => {
            const guest = guests.find((g) => g.id === id);
            if (guest) handleConfirm(guest);
          }}
          onCancelConfirmation={handleCancelConfirmation}
          onDecline={handleDecline}
          showActions={true}
        />
      </div>

      <GuestList
        title="Declinados (Spots Disponibles)"
        guests={declinedGuests}
        highlightedGuestId={highlightedGuestId}
        onReinvite={handleReinvite}
        showActions={true}
      />
    </div>
  );
};
