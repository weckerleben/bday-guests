import { useState, useEffect } from 'react';
import { Pricing, PricingItem } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';

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
  const [priceFormatted, setPriceFormatted] = useState<{ [key: string]: string }>({});
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const formatPrice = (value: number): string => {
    return value.toLocaleString('es-PY');
  };

  const parsePrice = (value: string): number => {
    // Remover todos los puntos (separadores de miles) y convertir a número
    const cleaned = value.replace(/\./g, '');
    return parseFloat(cleaned) || 0;
  };

  useEffect(() => {
    if (pricing?.items) {
      setItems(pricing.items);
      // Inicializar valores formateados
      const formatted: { [key: string]: string } = {};
      pricing.items.forEach((item) => {
        formatted[item.id] = formatPrice(item.price);
      });
      setPriceFormatted(formatted);
    } else {
      // Inicializar valores formateados para items por defecto
      const formatted: { [key: string]: string } = {};
      items.forEach((item) => {
        if (!priceFormatted[item.id]) {
          formatted[item.id] = formatPrice(item.price);
        }
      });
      if (Object.keys(formatted).length > 0) {
        setPriceFormatted({ ...priceFormatted, ...formatted });
      }
    }
  }, [pricing]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuOpenId && !target.closest('.pricing-item-menu-container')) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenId]);

  const handlePriceChange = (id: string, value: string) => {
    // Permitir solo números y puntos
    const cleaned = value.replace(/[^\d.]/g, '');
    // Actualizar el valor formateado mientras el usuario escribe
    setPriceFormatted({ ...priceFormatted, [id]: cleaned });
    // Actualizar el valor numérico
    const numericValue = parsePrice(cleaned);
    handleUpdateItem(id, { price: numericValue });
  };

  const handlePriceBlur = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setPriceFormatted({ ...priceFormatted, [id]: formatPrice(item.price) });
      setEditingPriceId(null);
    }
  };

  const handleAddItem = () => {
    const newItem: PricingItem = {
      id: Date.now().toString(),
      name: 'Nuevo Concepto',
      price: 0,
      type: 'fixed',
    };
    setItems([...items, newItem]);
    setPriceFormatted({ ...priceFormatted, [newItem.id]: '0' });
  };

  const [changedItemIds, setChangedItemIds] = useState<Set<string>>(new Set());

  const handleUpdateItem = (id: string, updates: Partial<PricingItem>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setHasChanges(true);
    setChangedItemIds(new Set([...changedItemIds, id]));
  };

  const handleDeleteItem = (id: string) => {
    setDeleteItemId(id);
    setMenuOpenId(null);
  };

  const confirmDelete = () => {
    if (deleteItemId) {
      const updatedItems = items.filter((item) => item.id !== deleteItemId);
      setItems(updatedItems);
      setDeleteItemId(null);
      setToast({ message: 'Concepto eliminado correctamente', type: 'success' });
      // Guardar automáticamente después de eliminar
      onPricingChange({ items: updatedItems });
      setHasChanges(false);
    }
  };

  const handleSave = () => {
    onPricingChange({ items });
    setToast({ message: 'Precios guardados correctamente', type: 'success' });
    setHasChanges(false);
    setChangedItemIds(new Set());
  };

  const handleDuplicateItem = (id: string) => {
    const itemToDuplicate = items.find((item) => item.id === id);
    if (itemToDuplicate) {
      const newItem: PricingItem = {
        ...itemToDuplicate,
        id: Date.now().toString(),
        name: `${itemToDuplicate.name} (copia)`,
      };
      setItems([...items, newItem]);
      setPriceFormatted({ ...priceFormatted, [newItem.id]: formatPrice(newItem.price) });
      setMenuOpenId(null);
      setHasChanges(true);
    }
  };

  const itemToDelete = deleteItemId ? items.find((item) => item.id === deleteItemId) : null;

  const getPersonTypeIcon = (type?: 'adult' | 'child' | 'baby') => {
    switch (type) {
      case 'adult':
        return <PersonIcon className="pricing-icon" />;
      case 'child':
        return <GroupIcon className="pricing-icon" />;
      case 'baby':
        return <ChildCareIcon className="pricing-icon" />;
      default:
        return null;
    }
  };

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
        <div className="pricing-header">
          <h2>Configuración de Precios</h2>
          <button className="button button-primary pricing-add-button-desktop" onClick={handleAddItem}>
            <AddIcon style={{ fontSize: '1rem' }} /> Añadir Concepto
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
                      type="text"
                      value={priceFormatted[item.id] ?? formatPrice(item.price)}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      onBlur={() => handlePriceBlur(item.id)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      inputMode="numeric"
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
        <div className="pricing-items-mobile">
          {items.map((item) => (
            <div key={item.id} className={`pricing-item-card ${changedItemIds.has(item.id) ? 'pricing-item-changed' : ''}`}>
              <div className="pricing-item-header-compact">
                {editingNameId === item.id ? (
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                    onBlur={() => setEditingNameId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingNameId(null);
                      }
                    }}
                    className="pricing-item-name-input-compact"
                    autoFocus
                  />
                ) : (
                  <h3 className="pricing-item-title-compact" onClick={() => setEditingNameId(item.id)}>
                    {item.name}
                  </h3>
                )}
                <div className="pricing-item-menu-container">
                  <button
                    className="button button-icon-only pricing-menu-button"
                    onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                    aria-label="Menú"
                  >
                    <MoreVertIcon />
                  </button>
                  {menuOpenId === item.id && (
                    <div className="pricing-item-menu">
                      <button
                        className="pricing-menu-item"
                        onClick={() => {
                          setEditingNameId(item.id);
                          setMenuOpenId(null);
                        }}
                      >
                        <EditIcon /> Editar nombre
                      </button>
                      <button
                        className="pricing-menu-item"
                        onClick={() => handleDuplicateItem(item.id)}
                      >
                        <AddIcon /> Duplicar
                      </button>
                      <button
                        className="pricing-menu-item pricing-menu-item-danger"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <DeleteIcon /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="pricing-item-body-compact">
                <div className={`pricing-item-row-compact ${item.type === 'fixed' ? 'pricing-row-fixed' : 'pricing-row-perperson'}`}>
                  <div className="pricing-item-field">
                    <label className="pricing-item-label-compact">
                      <LabelIcon className="pricing-label-icon" />
                      Tipo
                    </label>
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const newType = e.target.value as 'perPerson' | 'fixed';
                        handleUpdateItem(item.id, {
                          type: newType,
                          personType: newType === 'fixed' ? undefined : item.personType || 'adult',
                        });
                      }}
                      className="pricing-item-select-compact"
                    >
                      <option value="fixed">Fijo</option>
                      <option value="perPerson">Por Persona</option>
                    </select>
                  </div>
                  {item.type === 'perPerson' && (
                    <div className="pricing-item-field">
                      <label className="pricing-item-label-compact">
                        {getPersonTypeIcon(item.personType)}
                        Persona
                      </label>
                      <select
                        value={item.personType || 'adult'}
                        onChange={(e) =>
                          handleUpdateItem(item.id, {
                            personType: e.target.value as 'adult' | 'child' | 'baby',
                          })
                        }
                        className="pricing-item-select-compact"
                      >
                        <option value="adult">Adulto</option>
                        <option value="child">Niño</option>
                        <option value="baby">Bebé</option>
                      </select>
                    </div>
                  )}
                  <div className="pricing-item-field pricing-item-price-field">
                    <label className="pricing-item-label-compact">
                      <AttachMoneyIcon className="pricing-label-icon" />
                      Precio
                    </label>
                    {editingPriceId === item.id ? (
                      <input
                        type="text"
                        value={priceFormatted[item.id] ?? formatPrice(item.price)}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        onBlur={() => handlePriceBlur(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePriceBlur(item.id);
                          }
                        }}
                        className={`pricing-item-input-compact pricing-item-price-input ${item.price === 0 ? 'pricing-input-error' : ''}`}
                        autoFocus
                        inputMode="numeric"
                        placeholder="0"
                      />
                    ) : (
                      <div
                        className={`pricing-item-price-display ${item.price === 0 ? 'pricing-price-error' : ''}`}
                        onClick={() => setEditingPriceId(item.id)}
                      >
                        <span className="pricing-price-value">
                          {item.price === 0 ? (
                            <span className="pricing-price-placeholder">Ingrese precio</span>
                          ) : (
                            `Gs ${priceFormatted[item.id] ?? formatPrice(item.price)}`
                          )}
                        </span>
                        <EditIcon className="pricing-price-edit-icon" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className={`button ${hasChanges ? 'button-primary' : 'button-secondary'}`} 
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <SaveIcon style={{ fontSize: '1rem' }} /> Guardar Precios
        </button>
        <button 
          className="pricing-fab"
          onClick={handleAddItem}
          aria-label="Añadir Concepto"
          title="Añadir Concepto"
        >
          <AddIcon />
        </button>
      </div>
    </>
  );
};
