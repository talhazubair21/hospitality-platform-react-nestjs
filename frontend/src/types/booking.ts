export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type Booking = {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  totalAmount: number;
};

/** Shape of a booking in JSON (dates are ISO strings until parsed). */
export type BookingApi = Omit<Booking, 'checkIn' | 'checkOut'> & {
  checkIn: string;
  checkOut: string;
};

export function bookingFromApi(data: BookingApi): Booking {
  return {
    ...data,
    checkIn: new Date(data.checkIn),
    checkOut: new Date(data.checkOut),
  };
}
