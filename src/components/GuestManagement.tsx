import { useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Guest, BaseGuest } from '../types';
import { GuestList } from './GuestList';
import { GuestForm } from './GuestForm';
import { ConfirmModal } from './ConfirmModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';

interface GuestManagementProps {
  guests: Guest[];
  baseGuestIds: Set<string>; // IDs de invitados base (no se pueden eliminar)
  onGuestsChange: (guests: Guest[]) => void;
}

export const GuestManagement = ({ guests, baseGuestIds, onGuestsChange }: GuestManagementProps) => {
  const [confirmingGuest, setConfirmingGuest] = useState<Guest | null>(null);
  const [decliningGuestId, setDecliningGuestId] = useState<string | null>(null);
  const [deletingGuestId, setDeletingGuestId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleDelete = (id: string) => {
    // Solo permitir eliminar invitados adicionales
    if (baseGuestIds.has(id)) {
      setToast({
        message: 'No se pueden eliminar invitados base',
        type: 'error'
      });
      return;
    }
    setDeletingGuestId(id);
  };

  const confirmDelete = async () => {
    if (deletingGuestId) {
      const guest = guests.find((g) => g.id === deletingGuestId);
      
      // Eliminar el invitado de la lista
      const updatedGuests = guests.filter((g) => g.id !== deletingGuestId);
      onGuestsChange(updatedGuests);
      
      setDeletingGuestId(null);
      
      if (guest) {
        setToast({
          message: `🗑️ ${guest.familyName} eliminado`,
          type: 'info'
        });
      }
    }
  };

  const handleAddNewFamily = (formData: Omit<BaseGuest, 'id'>) => {
    // Calcular spots disponibles por tipo (adultos y niños por separado)
    // Usar la misma lógica que calculateSpots pero separado por tipo
    const declinedSpots = guests.reduce((acc, guest) => {
      if (guest.status === 'declined') {
        // Solo contar adultos y niños, excluir bebés
        return {
          adults: acc.adults + guest.adults,
          children: acc.children + guest.children,
        };
      }
      return acc;
    }, { adults: 0, children: 0 });

    const partialDeclined = guests.reduce((acc, guest) => {
      if (guest.status === 'confirmed') {
        // Si hay confirmación parcial, los no confirmados son spots disponibles
        // Solo contar adultos y niños, excluir bebés
        const adults = guest.confirmedAdults !== undefined ? guest.confirmedAdults : guest.adults;
        const children = guest.confirmedChildren !== undefined ? guest.confirmedChildren : guest.children;
        return {
          adults: acc.adults + (guest.adults - adults),
          children: acc.children + (guest.children - children),
        };
      }
      return acc;
    }, { adults: 0, children: 0 });

    const availableSpots = {
      adults: declinedSpots.adults + partialDeclined.adults,
      children: declinedSpots.children + partialDeclined.children,
    };
    
    // Validar que no exceda los spots disponibles por tipo
    if (formData.adults > availableSpots.adults) {
      setToast({
        message: `✗ No hay suficientes spots de adultos disponibles. Disponibles: ${availableSpots.adults}, Solicitados: ${formData.adults}`,
        type: 'error'
      });
      return;
    }
    if (formData.children > availableSpots.children) {
      setToast({
        message: `✗ No hay suficientes spots de niños disponibles. Disponibles: ${availableSpots.children}, Solicitados: ${formData.children}`,
        type: 'error'
      });
      return;
    }
    
    // Generar ID único para la nueva familia
    const maxId = Math.max(
      ...guests.map(g => parseInt(g.id) || 0),
      0
    );
    const newId = (maxId + 1).toString();
    
    const newGuest: Guest = {
      id: newId,
      ...formData,
      status: 'invited',
    };
    
    // Añadir a la lista de invitados
    const updatedGuests = [...guests, newGuest];
    onGuestsChange(updatedGuests);
    
    setShowAddForm(false);
    setHighlightedGuestId(newId);
    
    setToast({
      message: `✓ ${formData.familyName} añadido como nuevo invitado`,
      type: 'success'
    });
  };

  const invitedGuests = guests.filter((g) => g.status === 'invited');
  const confirmedGuests = guests.filter((g) => g.status === 'confirmed');
  const declinedGuests = guests.filter((g) => g.status === 'declined');

  const decliningGuest = decliningGuestId ? guests.find((g) => g.id === decliningGuestId) : null;
  
  // Calcular spots disponibles por tipo (adultos y niños por separado)
  // Usar la misma lógica que calculateSpots pero separado por tipo
  const declinedSpots = guests.reduce((acc, guest) => {
    if (guest.status === 'declined') {
      // Solo contar adultos y niños, excluir bebés
      return {
        adults: acc.adults + guest.adults,
        children: acc.children + guest.children,
      };
    }
    return acc;
  }, { adults: 0, children: 0 });

  const partialDeclined = guests.reduce((acc, guest) => {
    if (guest.status === 'confirmed') {
      // Si hay confirmación parcial, los no confirmados son spots disponibles
      // Solo contar adultos y niños, excluir bebés
      const adults = guest.confirmedAdults !== undefined ? guest.confirmedAdults : guest.adults;
      const children = guest.confirmedChildren !== undefined ? guest.confirmedChildren : guest.children;
      return {
        adults: acc.adults + (guest.adults - adults),
        children: acc.children + (guest.children - children),
      };
    }
    return acc;
  }, { adults: 0, children: 0 });

  const availableSpots = {
    adults: declinedSpots.adults + partialDeclined.adults,
    children: declinedSpots.children + partialDeclined.children,
  };

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

      {deletingGuestId && (() => {
        const guest = guests.find((g) => g.id === deletingGuestId);
        return guest ? (
          <ConfirmDialog
            title="Eliminar Invitado"
            message={`¿Estás seguro de eliminar a ${guest.familyName}? Esta acción no se puede deshacer.`}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingGuestId(null)}
            confirmText="Sí, Eliminar"
            cancelText="Cancelar"
            variant="danger"
          />
        ) : null;
      })()}

      {showAddForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Añadir Nueva Familia</h3>
            <button
              className="button button-secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </button>
          </div>
          <GuestForm
            guest={null}
            onSave={handleAddNewFamily}
            onCancel={() => setShowAddForm(false)}
            maxAdults={availableSpots.adults}
            maxChildren={availableSpots.children}
          />
        </div>
      )}

      <div className="guests-grid">
        <GuestList
          title="Invitados"
          guests={invitedGuests}
          highlightedGuestId={highlightedGuestId}
          baseGuestIds={baseGuestIds}
          onConfirm={(id) => {
            const guest = guests.find((g) => g.id === id);
            if (guest) handleConfirm(guest);
          }}
          onDecline={handleDecline}
          onDelete={handleDelete}
          showActions={true}
          headerAction={
            (availableSpots.adults > 0 || availableSpots.children > 0) ? (
              <button
                className="button button-primary"
                onClick={() => setShowAddForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <AddIcon style={{ fontSize: '1.2rem' }} /> Añadir Nueva Familia
                {(availableSpots.adults > 0 || availableSpots.children > 0) && (
                  <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    ({availableSpots.adults} adultos, {availableSpots.children} niños)
                  </span>
                )}
              </button>
            ) : null
          }
        />

        <GuestList
          title="Confirmados"
          guests={confirmedGuests}
          highlightedGuestId={highlightedGuestId}
          baseGuestIds={baseGuestIds}
          onConfirm={(id) => {
            const guest = guests.find((g) => g.id === id);
            if (guest) handleConfirm(guest);
          }}
          onCancelConfirmation={handleCancelConfirmation}
          onDecline={handleDecline}
          onDelete={handleDelete}
          showActions={true}
        />

        <GuestList
          title="Declinados (Spots Disponibles)"
          guests={declinedGuests}
          highlightedGuestId={highlightedGuestId}
          onReinvite={handleReinvite}
          showActions={true}
        />
      </div>
    </div>
  );
};
