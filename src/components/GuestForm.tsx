import { useState, useEffect } from 'react';
import { Guest } from '../types';

interface GuestFormProps {
  guest: Guest | null;
  onSave: (guest: Omit<Guest, 'id' | 'status' | 'confirmedAdults' | 'confirmedChildren' | 'confirmedBabies'>) => void;
  onCancel: () => void;
  maxSpots?: number; // Máximo de spots disponibles (solo adultos + niños, sin bebés) - DEPRECATED
  maxAdults?: number; // Máximo de adultos disponibles
  maxChildren?: number; // Máximo de niños disponibles
}

export const GuestForm = ({ guest, onSave, onCancel, maxSpots, maxAdults, maxChildren }: GuestFormProps) => {
  const [formData, setFormData] = useState({
    familyName: '',
    adults: 0,
    children: 0,
    babies: 0,
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (guest) {
      setFormData({
        familyName: guest.familyName,
        adults: guest.adults,
        children: guest.children,
        babies: guest.babies,
      });
    }
  }, [guest]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Validar límites por tipo (adultos y niños por separado)
      if (field === 'adults' && maxAdults !== undefined) {
        const adultsValue = typeof value === 'number' ? value : Number(value) || 0;
        if (adultsValue > maxAdults) {
          setError(`No puedes añadir más de ${maxAdults} adultos. Disponibles: ${maxAdults}, Solicitados: ${adultsValue}`);
        } else if (maxChildren !== undefined && updated.children > maxChildren) {
          setError(`No puedes añadir más de ${maxChildren} niños. Disponibles: ${maxChildren}, Solicitados: ${updated.children}`);
        } else {
          setError('');
        }
      } else if (field === 'children' && maxChildren !== undefined) {
        const childrenValue = typeof value === 'number' ? value : Number(value) || 0;
        if (childrenValue > maxChildren) {
          setError(`No puedes añadir más de ${maxChildren} niños. Disponibles: ${maxChildren}, Solicitados: ${childrenValue}`);
        } else if (maxAdults !== undefined && updated.adults > maxAdults) {
          setError(`No puedes añadir más de ${maxAdults} adultos. Disponibles: ${maxAdults}, Solicitados: ${updated.adults}`);
        } else {
          setError('');
        }
      } else if (maxSpots !== undefined && (field === 'adults' || field === 'children')) {
        // Fallback al método antiguo si no se proporcionan maxAdults/maxChildren
        const adultsValue = field === 'adults' ? (typeof value === 'number' ? value : Number(value) || 0) : updated.adults;
        const childrenValue = field === 'children' ? (typeof value === 'number' ? value : Number(value) || 0) : updated.children;
        const totalAdultsAndChildren = adultsValue + childrenValue;
        if (totalAdultsAndChildren > maxSpots) {
          setError(`No puedes añadir más de ${maxSpots} spots (adultos + niños). Tienes ${totalAdultsAndChildren} spots solicitados.`);
        } else {
          setError('');
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.familyName.trim()) {
      setError('Por favor ingresa el nombre de la familia');
      return;
    }
    if (formData.adults === 0 && formData.children === 0 && formData.babies === 0) {
      setError('Debes ingresar al menos un invitado');
      return;
    }
    
    // Validar límites por tipo (adultos y niños por separado)
    if (maxAdults !== undefined && formData.adults > maxAdults) {
      setError(`No puedes añadir más de ${maxAdults} adultos. Disponibles: ${maxAdults}, Solicitados: ${formData.adults}`);
      return;
    }
    if (maxChildren !== undefined && formData.children > maxChildren) {
      setError(`No puedes añadir más de ${maxChildren} niños. Disponibles: ${maxChildren}, Solicitados: ${formData.children}`);
      return;
    }
    // Fallback al método antiguo si no se proporcionan maxAdults/maxChildren
    if (maxSpots !== undefined && maxAdults === undefined && maxChildren === undefined) {
      const totalAdultsAndChildren = formData.adults + formData.children;
      if (totalAdultsAndChildren > maxSpots) {
        setError(`No puedes añadir más de ${maxSpots} spots (adultos + niños). Tienes ${totalAdultsAndChildren} spots solicitados.`);
        return;
      }
    }
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
      {(maxAdults !== undefined || maxChildren !== undefined || maxSpots !== undefined) && (
        <div style={{
          padding: '0.75rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: '#1e40af'
        }}>
          <strong>Spots disponibles:</strong>
          {maxAdults !== undefined || maxChildren !== undefined ? (
            <span>
              {maxAdults !== undefined && `${maxAdults} adultos`}
              {maxAdults !== undefined && maxChildren !== undefined && ' y '}
              {maxChildren !== undefined && `${maxChildren} niños`}
            </span>
          ) : (
            <span> {maxSpots} (solo adultos + niños)</span>
          )}
          . Los bebés no tienen límite.
        </div>
      )}
      {error && (
        <div style={{
          padding: '0.75rem',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          marginBottom: '1rem',
          color: '#991b1b',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      <div className="form-group">
        <label>Nombre de la Familia/Grupo</label>
        <input
          type="text"
          value={formData.familyName}
          onChange={(e) => handleChange('familyName', e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Adultos</label>
          <input
            type="number"
            min="0"
            value={formData.adults}
            onChange={(e) => handleChange('adults', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label>Niños</label>
          <input
            type="number"
            min="0"
            value={formData.children}
            onChange={(e) => handleChange('children', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label>Bebés</label>
          <input
            type="number"
            min="0"
            value={formData.babies}
            onChange={(e) => handleChange('babies', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="actions">
        <button type="submit" className="button button-primary">
          {guest ? 'Actualizar' : 'Añadir'}
        </button>
        <button type="button" className="button button-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

