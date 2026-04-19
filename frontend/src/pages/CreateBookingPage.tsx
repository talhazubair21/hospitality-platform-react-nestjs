import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import {
  createBookingSchema,
  type CreateBookingFormValues,
} from '../validation/createBookingSchema';
import { DateField, NumberField, TextField } from '../components/ui';
import { useCreateBookingMutation } from '../api/booking.api';

export function CreateBookingPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBookingFormValues>({
    resolver: yupResolver(
      createBookingSchema,
    ) as Resolver<CreateBookingFormValues>,
    defaultValues: {
      guestName: '',
      propertyName: '',
      checkIn: '',
      checkOut: '',
      totalAmount: 0,
    },
  });

  const createBooking = useCreateBookingMutation({
    onSuccess: () => {
      reset();
      navigate('/bookings');
    },
  });

  const onSubmit = (data: CreateBookingFormValues) => {
    createBooking.mutate({
      guestName: data.guestName,
      propertyName: data.propertyName,
      checkIn: new Date(data.checkIn).toISOString(),
      checkOut: new Date(data.checkOut).toISOString(),
      totalAmount: data.totalAmount,
    });
  };

  const submitting = createBooking.isPending;

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
          Validated on the client with Yup, then saved via the API.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-indigo-950/6 ring-1 ring-slate-200/80 backdrop-blur-md sm:p-8"
        noValidate
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500"
          aria-hidden
        />

        <fieldset
          disabled={submitting}
          className="space-y-5 pt-1 disabled:opacity-60"
        >
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
        </fieldset>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => reset()}
            disabled={submitting}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="inline-flex min-w-42 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? (
              <span
                className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/85 border-t-transparent"
                aria-hidden
              />
            ) : null}
            {submitting ? 'Saving…' : 'Save booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
