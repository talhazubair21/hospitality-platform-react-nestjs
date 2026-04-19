import { object, number, string } from 'yup';

export const createBookingSchema = object({
  guestName: string()
    .trim()
    .required('Guest name is required')
    .min(1, 'Guest name is required'),
  propertyName: string()
    .trim()
    .required('Property name is required')
    .min(1, 'Property name is required'),
  checkIn: string().required('Check-in date is required'),
  checkOut: string().required('Check-out date is required'),
  totalAmount: number()
    .typeError('Enter a valid amount')
    .required('Total amount is required')
    .min(0, 'Amount must be zero or greater'),
}).test({
  name: 'checkOutAfterCheckIn',
  exclusive: false,
  test: function checkDates(values) {
    const v = values as {
      checkIn?: string;
      checkOut?: string;
    };
    if (!v.checkIn || !v.checkOut) {
      return true;
    }
    const start = new Date(v.checkIn);
    const end = new Date(v.checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return this.createError({
        path: 'checkOut',
        message: 'Invalid date',
      });
    }
    if (end <= start) {
      return this.createError({
        path: 'checkOut',
        message: 'Check-out must be after check-in',
      });
    }
    return true;
  },
});

/** Explicit shape so react-hook-form and yupResolver agree (Yup's InferType can widen fields optional with object-level tests). */
export type CreateBookingFormValues = {
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
};
