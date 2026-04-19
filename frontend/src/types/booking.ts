export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

const STATUS_VALUES: BookingStatus[] = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
];

/**
 * Maps API / DB values to our canonical status so transition UIs match the backend.
 * Handles casing, hyphens vs underscores, and common aliases.
 */
export function parseBookingStatus(raw: unknown): BookingStatus {
  if (raw === null || raw === undefined || raw === '') {
    return 'pending';
  }

  const normalized = String(raw).trim().toLowerCase().replace(/-/g, '_');

  if ((STATUS_VALUES as readonly string[]).includes(normalized)) {
    return normalized as BookingStatus;
  }

  const aliases: Record<string, BookingStatus> = {
    canceled: 'cancelled',
    check_in: 'checked_in',
    check_out: 'checked_out',
  };

  return aliases[normalized] ?? 'pending';
}

export type Booking = {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Shape of a booking in JSON (dates are ISO strings until parsed). */
export type BookingApi = Omit<
  Booking,
  'checkIn' | 'checkOut' | 'createdAt' | 'updatedAt'
> & {
  checkIn: string;
  checkOut: string;
  createdAt?: string;
  updatedAt?: string;
};

export function bookingFromApi(data: BookingApi): Booking {
  return {
    ...data,
    status: parseBookingStatus(data.status),
    checkIn: new Date(data.checkIn),
    checkOut: new Date(data.checkOut),
    createdAt:
      data.createdAt != null && data.createdAt !== ''
        ? new Date(data.createdAt)
        : new Date(0),
    updatedAt:
      data.updatedAt != null && data.updatedAt !== ''
        ? new Date(data.updatedAt)
        : new Date(0),
  };
}
