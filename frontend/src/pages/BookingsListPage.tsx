import { useMemo, useState } from 'react';
import { mockBookings } from '../data/mockBookings';
import { BookingsTable } from '../components/bookings/BookingsTable';
import { SelectField, type SelectOption } from '../components/ui';
import type { BookingStatus } from '../types/booking';

const FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked in' },
  { value: 'checked_out', label: 'Checked out' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function BookingsListPage() {
  const [rows, setRows] = useState(mockBookings);
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    if (!statusFilter) {
      return rows;
    }
    return rows.filter((b) => b.status === statusFilter);
  }, [rows, statusFilter]);

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    setRows((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    );
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600/90">
          Dashboard
        </p>

        {/* Title row: Bookings (left) + filter (right) */}
        <div className="mt-2 flex flex-col gap-4 sm:mt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <h1 className="shrink-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Bookings
          </h1>
          <div className="w-full shrink-0 sm:w-auto sm:max-w-[11rem]">
            <div className="rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-2 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm">
              <SelectField
                id="status-filter"
                label="Status"
                compact
                options={FILTER_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Count directly below the title */}
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-semibold tabular-nums text-slate-900">
            {filtered.length}
          </span>
          <span className="text-slate-500"> of </span>
          <span className="font-medium tabular-nums text-slate-800">
            {rows.length}
          </span>
          <span className="text-slate-500"> bookings</span>
          {statusFilter ? (
            <span className="text-slate-400"> (filtered)</span>
          ) : null}
        </p>

        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          Reservations overview — sample data for layout; connect the API when
          ready.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/50 px-6 py-16 text-center shadow-inner">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            ∅
          </div>
          <p className="text-base font-medium text-slate-800">
            No bookings match this filter
          </p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try choosing &quot;All statuses&quot; or a different status.
          </p>
        </div>
      ) : (
        <BookingsTable
          bookings={filtered}
          onChangeStatus={handleStatusChange}
        />
      )}
    </div>
  );
}
