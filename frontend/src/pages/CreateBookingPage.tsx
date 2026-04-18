import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import {
  createBookingSchema,
  type CreateBookingFormValues,
} from '../validation/createBookingSchema';
import { DateField, NumberField, TextField } from '../components/ui';

export function CreateBookingPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateBookingFormValues>({
    resolver: yupResolver(createBookingSchema),
    defaultValues: {
      guestName: '',
      propertyName: '',
      checkIn: '',
      checkOut: '',
      totalAmount: 0,
    },
  });

  const onSubmit = (data: CreateBookingFormValues) => {
    console.log('Create booking (no API yet):', data);
    toast.success('Booking captured locally — API integration coming next.');
    reset();
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600/90">
          Create
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          New booking
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          Validated on the client with Yup. Submit does not call the server yet.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-indigo-950/[0.06] ring-1 ring-slate-200/80 backdrop-blur-md sm:p-8"
        noValidate
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500"
          aria-hidden
        />

        <div className="space-y-5 pt-1">
          <TextField
            id="guestName"
            label="Guest name"
            autoComplete="name"
            placeholder="e.g. Alex Rivera"
            error={errors.guestName?.message}
            {...register('guestName')}
          />

          <TextField
            id="propertyName"
            label="Property name"
            placeholder="e.g. Oceanview Suite 12"
            error={errors.propertyName?.message}
            {...register('propertyName')}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <DateField
              id="checkIn"
              label="Check-in"
              error={errors.checkIn?.message}
              {...register('checkIn')}
            />
            <DateField
              id="checkOut"
              label="Check-out"
              error={errors.checkOut?.message}
              {...register('checkOut')}
            />
          </div>

          <NumberField
            id="totalAmount"
            label="Total amount (USD)"
            step="0.01"
            min={0}
            placeholder="0.00"
            error={errors.totalAmount?.message}
            {...register('totalAmount', { valueAsNumber: true })}
          />
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => reset()}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-55"
          >
            Save booking
          </button>
        </div>
      </form>
    </div>
  );
}
