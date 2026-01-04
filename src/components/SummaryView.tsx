import { Guest, Pricing } from '../types';
import {
  calculateGuestStats,
  calculateCosts,
  calculateSpots,
  formatCurrency,
} from '../utils/calculations';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';

interface SummaryViewProps {
  guests: Guest[];
  pricing: Pricing | null;
}

export const SummaryView = ({ guests, pricing }: SummaryViewProps) => {
  if (!pricing) {
    return (
      <div className="card">
        <h2>Resumen</h2>
        <p style={{ color: '#ef4444' }}>
          Por favor configura los precios primero en la pestaña "Precios"
        </p>
      </div>
    );
  }

  // Para invitados, incluir invitados y confirmados (excluir solo declinados)
  const invitedGuests = guests.filter((g) => g.status !== 'declined');
  const invitedStats = calculateGuestStats(invitedGuests);
  const invitedCosts = calculateCosts(invitedGuests, pricing);

  // Para confirmados, solo los que están confirmados
  const confirmedGuests = guests.filter((g) => g.status === 'confirmed');
  const confirmedStats = calculateGuestStats(confirmedGuests);
  const confirmedCosts = calculateCosts(confirmedGuests, pricing);

  const spots = calculateSpots(guests);
  // Calcular capacidad total: confirmados + disponibles (declinados + parcialmente declinados)
  // Esto representa el total de spots que se han reservado en algún momento
  const totalCapacity = spots.reservedSpots + spots.availableSpots;
  const occupancyPercentage = totalCapacity > 0 
    ? Math.round((spots.reservedSpots / totalCapacity) * 100) 
    : 0;

  // Calcular capacidad total desglosada por adultos y niños (excluir bebés)
  // La capacidad total es la suma de todos los adultos y niños invitados originalmente
  const capacityAdults = guests.reduce((sum, guest) => {
    return sum + guest.adults;
  }, 0);
  
  const capacityChildren = guests.reduce((sum, guest) => {
    return sum + guest.children;
  }, 0);

  // Calcular confirmados desglosados por adultos y niños (excluir bebés)
  const confirmedAdults = guests.reduce((sum, guest) => {
    if (guest.status === 'confirmed') {
      const adults = guest.confirmedAdults !== undefined ? guest.confirmedAdults : guest.adults;
      return sum + adults;
    }
    return sum;
  }, 0);

  const confirmedChildren = guests.reduce((sum, guest) => {
    if (guest.status === 'confirmed') {
      const children = guest.confirmedChildren !== undefined ? guest.confirmedChildren : guest.children;
      return sum + children;
    }
    return sum;
  }, 0);

  return (
    <div>
      <div className="summary-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Fila 1, Columna 1: Resumen General */}
        <div className="card">
          <h2>Resumen General</h2>
          {spots.availableSpots > 0 && (
            <div className="summary-warning">
              <WarningIcon className="summary-warning-icon" />
              <div className="summary-warning-content">
                <div className="summary-warning-main">
                  <strong>{spots.availableSpots}</strong> lugares disponibles
                </div>
                <div className="summary-warning-details">
                  <span>Capacidad:</span>
                  <span className="summary-warning-detail-item">
                    <PersonIcon className="summary-warning-icon-small" />
                    <span>{capacityAdults}</span>
                  </span>
                  <span className="summary-warning-detail-item">
                    <GroupIcon className="summary-warning-icon-small" />
                    <span>{capacityChildren}</span>
                  </span>
                  <span className="summary-warning-separator">·</span>
                  <span>Confirmados:</span>
                  <span className="summary-warning-detail-item">
                    <PersonIcon className="summary-warning-icon-small" />
                    <span>{confirmedAdults}</span>
                  </span>
                  <span className="summary-warning-detail-item">
                    <GroupIcon className="summary-warning-icon-small" />
                    <span>{confirmedChildren}</span>
                  </span>
                </div>
                <div className="summary-warning-progress">
                  <div 
                    className="summary-warning-progress-bar" 
                    style={{ width: `${occupancyPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="stats-grid">
            <div className="stat-card stat-card-invited">
              <div className="stat-card-header">
                <PeopleIcon className="stat-icon stat-icon-invited" />
                <h3>Total Invitados — {invitedStats.totalGuests}</h3>
              </div>
              <div className="stat-chips">
                <span className="stat-chip">
                  <PersonIcon className="stat-chip-icon" />
                  <span className="stat-chip-value">{invitedStats.totalAdults}</span>
                </span>
                <span className="stat-chip-separator">·</span>
                <span className="stat-chip">
                  <GroupIcon className="stat-chip-icon" />
                  <span className="stat-chip-value">{invitedStats.totalChildren}</span>
                </span>
                <span className="stat-chip-separator">·</span>
                <span className="stat-chip">
                  <ChildCareIcon className="stat-chip-icon" />
                  <span className="stat-chip-value">{invitedStats.totalBabies}</span>
                </span>
              </div>
            </div>
            <div className="stat-card stat-card-confirmed">
              <div className="stat-card-header">
                <CheckCircleIcon className="stat-icon stat-icon-confirmed" />
                <h3>Total Confirmados — {confirmedStats.totalGuests}</h3>
              </div>
              <div className="stat-chips">
                <span className="stat-chip">
                  <PersonIcon className="stat-chip-icon" />
                  <span className="stat-chip-value">{confirmedStats.totalAdults}</span>
                </span>
                <span className="stat-chip-separator">·</span>
                <span className="stat-chip">
                  <GroupIcon className="stat-chip-icon" />
                  <span className="stat-chip-value">{confirmedStats.totalChildren}</span>
                </span>
                <span className="stat-chip-separator">·</span>
                <span className="stat-chip">
                  <ChildCareIcon className="stat-chip-icon" />
                  <span className="stat-chip-value">{confirmedStats.totalBabies}</span>
                </span>
              </div>
              <div className="stat-card-occupancy">
                <span className="stat-card-occupancy-percentage">{occupancyPercentage}%</span>
                <span className="stat-card-occupancy-label">de ocupación</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 1, Columna 2: Distribución de Pagos */}
        <div className="card">
          <h2>Distribución de Pagos</h2>
          {/* Tabla para desktop */}
          <div className="payment-table-desktop">
            <table className="table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Costos - Invitados</th>
                  <th>Costos - Confirmados</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Diana</strong></td>
                  <td>{formatCurrency(3000000)}</td>
                  <td>{formatCurrency(3000000)}</td>
                </tr>
                <tr>
                  <td><strong>William</strong></td>
                  <td>{formatCurrency(Math.max(0, invitedCosts.total - 3000000))}</td>
                  <td>{formatCurrency(Math.max(0, confirmedCosts.total - 3000000))}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', background: '#f3f4f6', fontSize: '1.1rem' }}>
                  <td>Total</td>
                  <td>{formatCurrency(invitedCosts.total)}</td>
                  <td>{formatCurrency(confirmedCosts.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Cards para móvil */}
          <div className="payment-cards-mobile">
            <div className="payment-card payment-card-person">
              <div className="payment-card-header">
                <strong>Diana</strong>
              </div>
              <div className="payment-card-body">
                <div className="payment-cost-item payment-cost-invited">
                  <div className="payment-cost-header">
                    <BarChartIcon className="payment-cost-icon" />
                    <span className="payment-cost-title">Invitados</span>
                  </div>
                  <div className="payment-cost-value">{formatCurrency(3000000)}</div>
                </div>
                <div className="payment-cost-item payment-cost-confirmed">
                  <div className="payment-cost-header">
                    <CheckCircleIcon className="payment-cost-icon" />
                    <span className="payment-cost-title">Confirmados</span>
                  </div>
                  <div className="payment-cost-value">{formatCurrency(3000000)}</div>
                </div>
              </div>
            </div>
            <div className="payment-card payment-card-person">
              <div className="payment-card-header">
                <strong>William</strong>
              </div>
              <div className="payment-card-body">
                <div className="payment-cost-item payment-cost-invited">
                  <div className="payment-cost-header">
                    <BarChartIcon className="payment-cost-icon" />
                    <span className="payment-cost-title">Invitados</span>
                  </div>
                  <div className="payment-cost-value">{formatCurrency(Math.max(0, invitedCosts.total - 3000000))}</div>
                </div>
                <div className="payment-cost-item payment-cost-confirmed">
                  <div className="payment-cost-header">
                    <CheckCircleIcon className="payment-cost-icon" />
                    <span className="payment-cost-title">Confirmados</span>
                  </div>
                  <div className="payment-cost-value">{formatCurrency(Math.max(0, confirmedCosts.total - 3000000))}</div>
                </div>
              </div>
            </div>
            <div className="payment-card payment-card-total">
              <div className="payment-card-header">
                <strong>Total</strong>
              </div>
              <div className="payment-card-body">
                <div className="payment-cost-item payment-cost-invited">
                  <div className="payment-cost-header">
                    <BarChartIcon className="payment-cost-icon" />
                    <span className="payment-cost-title">Invitados</span>
                  </div>
                  <div className="payment-cost-value">{formatCurrency(invitedCosts.total)}</div>
                </div>
                <div className="payment-cost-item payment-cost-confirmed">
                  <div className="payment-cost-header">
                    <CheckCircleIcon className="payment-cost-icon" />
                    <span className="payment-cost-title">Confirmados</span>
                  </div>
                  <div className="payment-cost-value">{formatCurrency(confirmedCosts.total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        {/* Fila 2, Columna 1: Costos - Invitados */}
        <div className="card">
          <h2>Costos - Invitados</h2>
          {/* Tabla para desktop */}
          <div className="cost-table-desktop">
            <table className="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invitedCosts.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: '#f9fafb' }}>
                  <td colSpan={3}>Total (Invitados)</td>
                  <td>{formatCurrency(invitedCosts.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Cards para móvil */}
          <div className="cost-cards-mobile">
            {invitedCosts.items.map((item, index) => (
              <div key={index} className="cost-card">
                <div className="cost-card-row-compact">
                  <span className="cost-card-name">{item.name}</span>
                  <div className="cost-card-calculation">
                    <span className="cost-card-quantity">{item.quantity}</span>
                    <span className="cost-card-multiply">×</span>
                    <span className="cost-card-unit-price">{formatCurrency(item.unitPrice)}</span>
                    <span className="cost-card-arrow">→</span>
                    <span className="cost-card-total-value">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="cost-card cost-card-summary">
              <div className="cost-card-row-compact">
                <span className="cost-card-label">Total (Invitados)</span>
                <span className="cost-card-total-value">{formatCurrency(invitedCosts.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2, Columna 2: Costos - Confirmados (A Pagar) */}
        <div className="card">
          <h2>Costos - Confirmados (A Pagar)</h2>
          {/* Tabla para desktop */}
          <div className="cost-table-desktop">
            <table className="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {confirmedCosts.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: '#e0f2fe', fontSize: '1.1rem' }}>
                  <td colSpan={3}>TOTAL A PAGAR</td>
                  <td style={{ color: '#0369a1' }}>{formatCurrency(confirmedCosts.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Cards para móvil */}
          <div className="cost-cards-mobile">
            {confirmedCosts.items.map((item, index) => (
              <div key={index} className="cost-card">
                <div className="cost-card-row-compact">
                  <span className="cost-card-name">{item.name}</span>
                  <div className="cost-card-calculation">
                    <span className="cost-card-quantity">{item.quantity}</span>
                    <span className="cost-card-multiply">×</span>
                    <span className="cost-card-unit-price">{formatCurrency(item.unitPrice)}</span>
                    <span className="cost-card-arrow">→</span>
                    <span className="cost-card-total-value">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="cost-card cost-card-summary cost-card-payable">
              <div className="cost-card-row-compact">
                <span className="cost-card-label">TOTAL A PAGAR</span>
                <span className="cost-card-total-value">{formatCurrency(confirmedCosts.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
