import { BaseGuest, Guest, GuestStatus } from '../types';

export const mergeGuestsWithStatuses = (
  baseGuests: BaseGuest[],
  additionalGuests: BaseGuest[],
  statuses: GuestStatus[]
): Guest[] => {
  const statusMap = new Map<string, GuestStatus>();
  statuses.forEach((status) => {
    statusMap.set(status.id, status);
  });

  // Combinar baseGuests y additionalGuests
  const allGuests = [...baseGuests, ...additionalGuests];

  return allGuests.map((baseGuest) => {
    const status = statusMap.get(baseGuest.id);
    if (status) {
      return {
        ...baseGuest,
        status: status.status,
        confirmedAdults: status.confirmedAdults,
        confirmedChildren: status.confirmedChildren,
        confirmedBabies: status.confirmedBabies,
      };
    }
    // Si no hay estado, por defecto es 'invited'
    return {
      ...baseGuest,
      status: 'invited' as const,
    };
  });
};
