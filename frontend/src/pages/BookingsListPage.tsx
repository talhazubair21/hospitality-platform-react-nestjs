import { useState } from 'react';
import { BookingsTable } from '../components/bookings/BookingsTable';
import { SelectField, type SelectOption } from '../components/ui';
import type { BookingStatus } from '../types/booking';
import { getBookingsListErrorPanel } from '../api/errors';
import {
  useBookingsQuery,
  useUpdateBookingStatusMutation,
} from '../api/booking.api';

const FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked in' },
  { value: 'checked_out', label: 'Checked out' },
  { value: 'cancelled', label: 'Cancelled' },
];

function BookingsListLoader() {
  return (
    <div
      className="flex min-h-[min(60vh,28rem)] w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/50"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <span
          className="h-9 w-9 shrink-0 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-600">Loading bookings…</p>
      </div>
    </div>
  );
}

export function BookingsListPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const {
    data: rows = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
    isFetching,
  } = useBookingsQuery(statusFilter);

  const loadErrorPanel =
    queryError != null ? getBookingsListErrorPanel(queryError) : null;

  const updateStatus = useUpdateBookingStatusMutation();
  const updatingId =
    updateStatus.isPending && updateStatus.variables
      ? updateStatus.variables.id
      : null;

  const bookingCount = rows.length;

  const subtitle =
    isLoading ? null : (
      <p className="mt-3 text-sm text-slate-600">
        <span className="font-semibold tabular-nums text-slate-900">
          {bookingCount}
        </span>
        <span className="text-slate-500">
          {' '}
          booking{bookingCount === 1 ? '' : 's'}
        </span>
        {statusFilter ? (
          <span className="text-slate-400"> (filtered)</span>
        ) : null}
        {isFetching && !isLoading ? (
          <span className="ml-2 text-xs font-medium text-indigo-600">
            Refreshing…
          </span>
        ) : null}
      </p>
    );

  const handleStatusChange = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    await updateStatus.mutateAsync({ id: bookingId, status });
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600/90">
          Dashboard
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:mt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <h1 className="shrink-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Bookings
          </h1>
          <div className="w-full shrink-0 sm:w-auto sm:max-w-44">
            <div className="rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-2 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm">
              <SelectField
                id="status-filter"
                label="Status"
                compact
                options={FILTER_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {subtitle}

        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          Reservations from your API — update status with the actions in each
          row.
        </p>
      </div>

      {isLoading ? <BookingsListLoader /> : null}

      {!isLoading && isError && loadErrorPanel ? (
        <div
          className="rounded-2xl border border-rose-200/90 bg-linear-to-b from-rose-50/95 to-white px-6 py-12 shadow-lg shadow-rose-900/5 ring-1 ring-rose-100/80 sm:px-10"
          role="alert"
          aria-live="assertive"
        >
          <div className="mx-auto max-w-lg text-center">
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 ring-1 ring-rose-200/80"
              aria-hidden
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-rose-950 sm:text-xl">
              {loadErrorPanel.title}
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-rose-900/85 sm:text-base">
              {loadErrorPanel.description}
            </p>
            <p className="mt-5 text-pretty border-t border-rose-200/70 pt-5 text-left text-xs leading-relaxed text-slate-600 sm:text-sm">
              {loadErrorPanel.hint}
            </p>
            <button
              type="button"
              className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-900/10 transition hover:bg-indigo-500 sm:w-auto sm:min-w-44"
              onClick={() => void refetch()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading && !isError && bookingCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/50 px-6 py-16 text-center shadow-inner">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            ∅
          </div>
          <p className="text-base font-medium text-slate-800">
            {statusFilter ? 'No bookings match this filter' : 'No bookings yet'}
          </p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {statusFilter
              ? 'Try choosing “All statuses” or a different status.'
              : 'Create a booking from the New booking tab to see it here.'}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && bookingCount > 0 ? (
        <BookingsTable
          bookings={rows}
          onChangeStatus={handleStatusChange}
          statusUpdatePending={updateStatus.isPending}
          statusUpdateForBookingId={updatingId}
        />
      ) : null}
    </div>
  );
}
