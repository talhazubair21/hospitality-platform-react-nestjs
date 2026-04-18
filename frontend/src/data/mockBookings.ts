import { parseISO } from 'date-fns';
import type { Booking } from '../types/booking';

export const mockBookings: Booking[] = [
  {
    id: '1',
    guestName: 'Alex Rivera',
    propertyName: 'Oceanview Suite 12',
    checkIn: parseISO('2026-05-01'),
    checkOut: parseISO('2026-05-04'),
    status: 'pending',
    totalAmount: 450,
  },
  {
    id: '2',
    guestName: 'Jordan Lee',
    propertyName: 'Downtown Loft 4',
    checkIn: parseISO('2026-05-10'),
    checkOut: parseISO('2026-05-13'),
    status: 'confirmed',
    totalAmount: 620.5,
  },
  {
    id: '3',
    guestName: 'Sam Patel',
    propertyName: 'Garden Villa B',
    checkIn: parseISO('2026-04-18'),
    checkOut: parseISO('2026-04-23'),
    status: 'checked_in',
    totalAmount: 980,
  },
  {
    id: '4',
    guestName: 'Taylor Morgan',
    propertyName: 'Harbor Penthouse',
    checkIn: parseISO('2026-03-01'),
    checkOut: parseISO('2026-03-05'),
    status: 'checked_out',
    totalAmount: 2100,
  },
  {
    id: '5',
    guestName: 'Casey Nguyen',
    propertyName: 'Studio North 2',
    checkIn: parseISO('2026-06-01'),
    checkOut: parseISO('2026-06-03'),
    status: 'cancelled',
    totalAmount: 199.99,
  },
];
