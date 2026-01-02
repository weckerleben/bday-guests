import { useState, useEffect } from 'react';
import { Guest } from '../types';

interface GuestFormProps {
  guest: Guest | null;
  onSave: (guest: Omit<Guest, 'id' | 'status' | 'confirmedAdults' | 'confirmedChildren' | 'confirmedBabies'>) => void;
  onCancel: () => void;
  maxSpots?: number; // Máximo de spots disponibles (solo adultos + niños, sin bebés)
}

export const GuestForm = ({ guest, onSave, onCancel, maxSpots }: GuestFormProps) => {
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
      
      // Validar límite de spots (solo adultos + niños, bebés no tienen límite)
      if (maxSpots !== undefined && (field === 'adults' || field === 'children')) {
        const totalAdultsAndChildren = (field === 'adults' ? value : updated.adults) as number + 
                                       (field === 'children' ? value : updated.children) as number;
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
    
    // Validar límite de spots (solo adultos + niños)
    if (maxSpots !== undefined) {
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
      {maxSpots !== undefined && (
        <div style={{
          padding: '0.75rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: '#1e40af'
        }}>
          <strong>Spots disponibles:</strong> {maxSpots} (solo adultos + niños). Los bebés no tienen límite.
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

