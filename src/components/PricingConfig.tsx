import { useState, useEffect } from 'react';
import { Pricing, PricingItem } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';

interface PricingConfigProps {
  pricing: Pricing | null;
  onPricingChange: (pricing: Pricing) => void;
}

export const PricingConfig = ({ pricing, onPricingChange }: PricingConfigProps) => {
  const [items, setItems] = useState<PricingItem[]>(
    pricing?.items || [
      { id: '1', name: 'Combo Adulto', price: 33000, type: 'perPerson', personType: 'adult' },
      { id: '2', name: 'Combo Niño', price: 39000, type: 'perPerson', personType: 'child' },
      { id: '3', name: 'Alquiler', price: 2700000, type: 'fixed' },
      { id: '4', name: 'Mesa Dulces', price: 485000, type: 'fixed' },
    ]
  );
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (pricing?.items) {
      setItems(pricing.items);
    }
  }, [pricing]);

  const handleAddItem = () => {
    const newItem: PricingItem = {
      id: Date.now().toString(),
      name: 'Nuevo Concepto',
      price: 0,
      type: 'fixed',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<PricingItem>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setDeleteItemId(id);
  };

  const confirmDelete = () => {
    if (deleteItemId) {
      setItems(items.filter((item) => item.id !== deleteItemId));
      setDeleteItemId(null);
      setToast({ message: 'Concepto eliminado correctamente', type: 'success' });
    }
  };

  const handleSave = () => {
    onPricingChange({ items });
    setToast({ message: 'Precios guardados correctamente', type: 'success' });
  };

  const itemToDelete = deleteItemId ? items.find((item) => item.id === deleteItemId) : null;

  return (
    <>
      {deleteItemId && itemToDelete && (
        <ConfirmDialog
          title="Eliminar Concepto"
          message={`¿Estás seguro de eliminar "${itemToDelete.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteItemId(null)}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ flex: '1 1 auto', minWidth: '200px' }}>Configuración de Precios</h2>
        <button className="button button-primary" onClick={handleAddItem} style={{ flex: '0 0 auto' }}>
          + Añadir Concepto
        </button>
      </div>

      {/* Tabla para desktop */}
      <div className="pricing-table-desktop" style={{ marginBottom: '1rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Tipo</th>
              <th>Tipo de Persona</th>
              <th>Precio (₲)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </td>
                <td>
                  <select
                    value={item.type}
                    onChange={(e) => {
                      const newType = e.target.value as 'perPerson' | 'fixed';
                      handleUpdateItem(item.id, {
                        type: newType,
                        personType: newType === 'fixed' ? undefined : item.personType || 'adult',
                      });
                    }}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="fixed">Fijo</option>
                    <option value="perPerson">Por Persona</option>
                  </select>
                </td>
                <td>
                  {item.type === 'perPerson' ? (
                    <select
                      value={item.personType || 'adult'}
                      onChange={(e) =>
                        handleUpdateItem(item.id, {
                          personType: e.target.value as 'adult' | 'child' | 'baby',
                        })
                      }
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="adult">Adulto</option>
                      <option value="child">Niño</option>
                      <option value="baby">Bebé</option>
                    </select>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>-</span>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </td>
                <td>
                  <button
                    className="button button-danger button-small"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards para móvil */}
      <div className="pricing-items-mobile" style={{ marginBottom: '1rem' }}>
        {items.map((item) => (
          <div key={item.id} className="pricing-item-card">
            <div className="form-group">
              <label>Concepto</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={item.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'perPerson' | 'fixed';
                    handleUpdateItem(item.id, {
                      type: newType,
                      personType: newType === 'fixed' ? undefined : item.personType || 'adult',
                    });
                  }}
                >
                  <option value="fixed">Fijo</option>
                  <option value="perPerson">Por Persona</option>
                </select>
              </div>
              {item.type === 'perPerson' && (
                <div className="form-group">
                  <label>Tipo de Persona</label>
                  <select
                    value={item.personType || 'adult'}
                    onChange={(e) =>
                      handleUpdateItem(item.id, {
                        personType: e.target.value as 'adult' | 'child' | 'baby',
                      })
                    }
                  >
                    <option value="adult">Adulto</option>
                    <option value="child">Niño</option>
                    <option value="baby">Bebé</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Precio (₲)</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                className="button button-danger button-small"
                onClick={() => handleDeleteItem(item.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="button button-primary" onClick={handleSave}>
        Guardar Precios
      </button>
    </div>
    </>
  );
};