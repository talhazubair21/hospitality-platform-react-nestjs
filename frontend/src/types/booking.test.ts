import { describe, expect, it } from 'vitest';
import { bookingFromApi, parseBookingStatus, type BookingApi } from './booking';

describe('parseBookingStatus', () => {
  it('normalizes casing and hyphenated values', () => {
    expect(parseBookingStatus('CHECKED_IN')).toBe('checked_in');
    expect(parseBookingStatus('checked-in')).toBe('checked_in');
  });

  it('maps common aliases', () => {
    expect(parseBookingStatus('canceled')).toBe('cancelled');
  });

  it('defaults unknown values to pending', () => {
    expect(parseBookingStatus('unknown')).toBe('pending');
    expect(parseBookingStatus('')).toBe('pending');
  });
});

describe('bookingFromApi', () => {
  it('parses dates and status from API payload', () => {
    const api: BookingApi = {
      id: '64a1b2c3d4e5f67890123456',
      guestName: 'Riley',
      propertyName: 'Desert Loft',
      checkIn: '2026-04-01T00:00:00.000Z',
      checkOut: '2026-04-03T00:00:00.000Z',
      status: 'confirmed',
      totalAmount: 88,
      createdAt: '2026-03-15T10:00:00.000Z',
      updatedAt: '2026-03-15T10:00:00.000Z',
    };

    const booking = bookingFromApi(api);

    expect(booking.checkIn.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    expect(booking.checkOut.toISOString()).toBe('2026-04-03T00:00:00.000Z');
    expect(booking.status).toBe('confirmed');
    expect(booking.createdAt.getTime()).toBeGreaterThan(0);
  });
});
