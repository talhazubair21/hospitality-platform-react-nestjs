import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

function dtoFromPlain(plain: Record<string, unknown>) {
  return plainToInstance(CreateBookingDto, plain);
}

describe('CreateBookingDto', () => {
  const base = {
    guestName: 'Jordan Lee',
    propertyName: 'Ocean View',
    checkIn: '2026-07-10T12:00:00.000Z',
    checkOut: '2026-07-15T12:00:00.000Z',
    totalAmount: 450,
  };

  it('accepts a valid payload', async () => {
    const dto = dtoFromPlain(base);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects missing guest name', async () => {
    const dto = dtoFromPlain({ ...base, guestName: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'guestName')).toBe(true);
  });

  it('rejects negative total amount', async () => {
    const dto = dtoFromPlain({ ...base, totalAmount: -1 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'totalAmount')).toBe(true);
  });

  it('rejects check-out on or before check-in', async () => {
    const dto = dtoFromPlain({
      ...base,
      checkIn: '2026-08-10T12:00:00.000Z',
      checkOut: '2026-08-10T12:00:00.000Z',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'checkOut')).toBe(true);
  });
});
