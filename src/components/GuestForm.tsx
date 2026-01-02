import { useState, useEffect } from 'react';
import { Guest } from '../types';

interface GuestFormProps {
  guest: Guest | null;
  onSave: (guest: Omit<Guest, 'id' | 'status' | 'confirmedAdults' | 'confirmedChildren' | 'confirmedBabies'>) => void;
  onCancel: () => void;
}

export const GuestForm = ({ guest, onSave, onCancel }: GuestFormProps) => {
  const [formData, setFormData] = useState({
    familyName: '',
    adults: 0,
    children: 0,
    babies: 0,
  });

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyName.trim()) {
      alert('Por favor ingresa el nombre de la familia');
      return;
    }
    if (formData.adults === 0 && formData.children === 0 && formData.babies === 0) {
      alert('Debes ingresar al menos un invitado');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
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
