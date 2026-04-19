import { describe, expect, it } from 'vitest';
import { createBookingSchema } from './createBookingSchema';

describe('createBookingSchema', () => {
  const valid = {
    guestName: 'Sam Taylor',
    propertyName: 'Hill Cabin',
    checkIn: '2026-09-01',
    checkOut: '2026-09-05',
    totalAmount: 320,
  };

  it('validates a correct form', async () => {
    await expect(createBookingSchema.validate(valid)).resolves.toEqual(valid);
  });

  it('requires guest name', async () => {
    await expect(
      createBookingSchema.validate({ ...valid, guestName: '' }),
    ).rejects.toMatchObject({ path: 'guestName' });
  });

  it('requires check-out after check-in', async () => {
    await expect(
      createBookingSchema.validate({
        ...valid,
        checkIn: '2026-10-05',
        checkOut: '2026-10-04',
      }),
    ).rejects.toMatchObject({ path: 'checkOut' });
  });

  it('rejects negative amounts', async () => {
    await expect(
      createBookingSchema.validate({ ...valid, totalAmount: -10 }),
    ).rejects.toMatchObject({ path: 'totalAmount' });
  });
});
