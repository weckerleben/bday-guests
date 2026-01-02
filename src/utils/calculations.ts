import { Guest, GuestStats, CostBreakdown, Pricing, SpotsInfo } from '../types';

export const calculateGuestStats = (guests: Guest[]): GuestStats => {
  return guests.reduce(
    (acc, guest) => {
      // Para confirmados, usar las cantidades confirmadas si existen
      const adults = guest.status === 'confirmed' && guest.confirmedAdults !== undefined
        ? guest.confirmedAdults
        : guest.adults;
      const children = guest.status === 'confirmed' && guest.confirmedChildren !== undefined
        ? guest.confirmedChildren
        : guest.children;
      const babies = guest.status === 'confirmed' && guest.confirmedBabies !== undefined
        ? guest.confirmedBabies
        : guest.babies;
      
      return {
        totalAdults: acc.totalAdults + adults,
        totalChildren: acc.totalChildren + children,
        totalBabies: acc.totalBabies + babies,
        totalGuests: acc.totalGuests + adults + children + babies,
      };
    },
    { totalAdults: 0, totalChildren: 0, totalBabies: 0, totalGuests: 0 }
  );
};

export const calculateCosts = (guests: Guest[], pricing: Pricing): CostBreakdown => {
  const stats = calculateGuestStats(guests);
  const items: CostBreakdown['items'] = [];
  let total = 0;

  pricing.items.forEach((item) => {
    if (item.type === 'perPerson') {
      let quantity = 0;
      if (item.personType === 'adult') {
        quantity = stats.totalAdults;
      } else if (item.personType === 'child') {
        quantity = stats.totalChildren;
      } else if (item.personType === 'baby') {
        quantity = stats.totalBabies;
      }
      const itemTotal = quantity * item.price;
      items.push({
        name: item.name,
        quantity,
        unitPrice: item.price,
        total: itemTotal,
      });
      total += itemTotal;
    } else if (item.type === 'fixed') {
      items.push({
        name: item.name,
        quantity: 1,
        unitPrice: item.price,
        total: item.price,
      });
      total += item.price;
    }
  });

  return {
    items,
    total,
  };
};

export const calculateSpots = (guests: Guest[]): SpotsInfo => {
  const totalSpots = guests.reduce((sum, guest) => {
    if (guest.status === 'invited' || guest.status === 'confirmed') {
      return sum + guest.adults + guest.children + guest.babies;
    }
    return sum;
  }, 0);

  const reservedSpots = guests.reduce((sum, guest) => {
    if (guest.status === 'confirmed') {
      // Usar cantidades confirmadas si existen
      const adults = guest.confirmedAdults !== undefined ? guest.confirmedAdults : guest.adults;
      const children = guest.confirmedChildren !== undefined ? guest.confirmedChildren : guest.children;
      const babies = guest.confirmedBabies !== undefined ? guest.confirmedBabies : guest.babies;
      return sum + adults + children + babies;
    }
    return sum;
  }, 0);

  const declinedSpots = guests.reduce((sum, guest) => {
    if (guest.status === 'declined') {
      return sum + guest.adults + guest.children + guest.babies;
    }
    return sum;
  }, 0);

  // Calcular spots disponibles: invitados totales - confirmados (usando cantidades confirmadas) - declinados
  const invitedSpots = guests.reduce((sum, guest) => {
    if (guest.status === 'invited') {
      return sum + guest.adults + guest.children + guest.babies;
    }
    return sum;
  }, 0);

  const partialDeclined = guests.reduce((sum, guest) => {
    if (guest.status === 'confirmed') {
      // Si hay confirmación parcial, los no confirmados son spots disponibles
      const adults = guest.confirmedAdults !== undefined ? guest.confirmedAdults : guest.adults;
      const children = guest.confirmedChildren !== undefined ? guest.confirmedChildren : guest.children;
      const babies = guest.confirmedBabies !== undefined ? guest.confirmedBabies : guest.babies;
      const notConfirmed = (guest.adults - adults) + (guest.children - children) + (guest.babies - babies);
      return sum + notConfirmed;
    }
    return sum;
  }, 0);

  return {
    totalSpots,
    reservedSpots,
    availableSpots: declinedSpots + partialDeclined,
    declinedSpots,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
