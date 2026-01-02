import { BaseGuest } from '../types';
import guestsData from '../data/guests.json';

export const loadBaseGuests = (): BaseGuest[] => {
  return guestsData.guests.map((guest) => ({
    id: guest.id,
    familyName: guest.familyName,
    adults: guest.adults,
    children: guest.children,
    babies: guest.babies,
  }));
};
