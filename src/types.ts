export interface BaseGuest {
  id: string;
  familyName: string;
  adults: number;
  children: number;
  babies: number;
}

export interface GuestStatus {
  id: string; // ID del invitado base
  status: 'invited' | 'confirmed' | 'declined';
  // Cantidades confirmadas (para confirmación parcial)
  confirmedAdults?: number;
  confirmedChildren?: number;
  confirmedBabies?: number;
}

export interface Guest extends BaseGuest {
  status: 'invited' | 'confirmed' | 'declined';
  confirmedAdults?: number;
  confirmedChildren?: number;
  confirmedBabies?: number;
}

export interface PricingItem {
  id: string;
  name: string;
  price: number;
  type: 'perPerson' | 'fixed';
  personType?: 'adult' | 'child' | 'baby'; // Solo si type es 'perPerson'
}

export interface Pricing {
  items: PricingItem[];
}

export interface GuestStats {
  totalAdults: number;
  totalChildren: number;
  totalBabies: number;
  totalGuests: number;
}

export interface CostBreakdown {
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  total: number;
}

export interface SpotsInfo {
  totalSpots: number;
  reservedSpots: number;
  availableSpots: number;
  declinedSpots: number;
}
