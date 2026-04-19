import { useCallback, useEffect, useState } from 'react';
import { format, isValid } from 'date-fns';
import {
  parseBookingStatus,
  type Booking,
  type BookingStatus,
} from '../../types/booking';

export type BookingsTableProps = {
  bookings: Booking[];
  onChangeStatus?: (
    bookingId: string,
    status: BookingStatus,
  ) => void | Promise<void>;
  /** True while a status PATCH is in flight (React Query mutation). */
  statusUpdatePending?: boolean;
  /** Booking id being updated, when `statusUpdatePending`. */
  statusUpdateForBookingId?: string | null;
};

const statusLabel: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
  cancelled: 'Cancelled',
};

const statusClass: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-900 ring-amber-500/25',
  confirmed: 'bg-sky-50 text-sky-900 ring-sky-500/25',
  checked_in: 'bg-emerald-50 text-emerald-900 ring-emerald-500/25',
  checked_out: 'bg-slate-100 text-slate-800 ring-slate-400/25',
  cancelled: 'bg-rose-50 text-rose-900 ring-rose-500/25',
};

function formatDate(value: Date) {
  if (!isValid(value)) {
    return '—';
  }
  return format(value, 'MMM d, yyyy');
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** Terminal states: no status dropdown. */
function isTerminalBookingStatus(status: BookingStatus): boolean {
  return status === 'checked_out' || status === 'cancelled';
}

function nextStatusOptions(
  current: BookingStatus | string,
): { value: BookingStatus; label: string }[] {
  const normalized = parseBookingStatus(current);
  const map: Record<BookingStatus, BookingStatus[]> = {
    /** All other statuses except pending */
    pending: ['confirmed', 'checked_in', 'checked_out', 'cancelled'],
    /** Next three in the flow */
    confirmed: ['checked_in', 'checked_out', 'cancelled'],
    /** Two options */
    checked_in: ['checked_out', 'cancelled'],
    checked_out: [],
    cancelled: [],
  };
  return (map[normalized] ?? []).map((v) => ({
    value: v,
    label: `→ ${statusLabel[v]}`,
  }));
}

function StatusChangeConfirmModal({
  open,
  guestName,
  currentLabel,
  nextLabel,
  onConfirm,
  onCancel,
  isUpdating,
}: {
  open: boolean;
  guestName: string;
  currentLabel: string;
  nextLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isUpdating: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-confirm-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-900/15 ring-1 ring-slate-200/60"
      >
        <h2
          id="status-confirm-title"
          className="text-lg font-semibold text-slate-900"
        >
          Update booking status?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Change status for{' '}
          <span className="font-medium text-slate-800">{guestName}</span> from{' '}
          <span className="font-medium text-slate-800">{currentLabel}</span> to{' '}
          <span className="font-medium text-slate-800">{nextLabel}</span>.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onCancel}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent"
                aria-hidden
              />
            ) : null}
            {isUpdating ? 'Updating…' : 'Confirm update'}
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_CONTROL_H = 'h-10';

function StatusSelect({
  row,
  onSelectNextStatus,
  disabled,
}: {
  row: Booking;
  onSelectNextStatus: (row: Booking, status: BookingStatus) => void;
  disabled?: boolean;
}) {
  const status = parseBookingStatus(row.status);
  if (isTerminalBookingStatus(status)) {
    return null;
  }

  const opts = nextStatusOptions(status);
  const shell = `flex w-full min-w-48 max-w-56 shrink-0 items-center ${STATUS_CONTROL_H}`;

  if (opts.length === 0) {
    return (
      <div className={shell}>
        <span className="text-xs text-slate-400">—</span>
      </div>
    );
  }
  return (
    <div className={shell}>
      <select
        key={`${row.id}-${parseBookingStatus(row.status)}`}
        disabled={disabled}
        className={`${STATUS_CONTROL_H} w-full min-h-0 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs font-medium leading-none text-slate-800 shadow-sm outline-none ring-1 ring-slate-200/60 transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1rem',
        }}
        defaultValue=""
        aria-label={`Change status for ${row.guestName}`}
        onChange={(e) => {
          const el = e.target as HTMLSelectElement;
          const v = el.value as BookingStatus;
          if (v) {
            onSelectNextStatus(row, v);
            el.value = '';
          }
        }}
      >
        <option value="" disabled>
          Change status…
        </option>
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function BookingsTable({
  bookings,
  onChangeStatus,
  statusUpdatePending = false,
  statusUpdateForBookingId = null,
}: BookingsTableProps) {
  const [pending, setPending] = useState<{
    booking: Booking;
    nextStatus: BookingStatus;
  } | null>(null);

  const handleSelectNextStatus = (row: Booking, nextStatus: BookingStatus) => {
    setPending({ booking: row, nextStatus });
  };

  const handleConfirmStatus = useCallback(async () => {
    if (!pending || !onChangeStatus) return;
    try {
      await onChangeStatus(pending.booking.id, pending.nextStatus);
      setPending(null);
    } catch {
      /* Error toast comes from booking API mutation */
    }
  }, [pending, onChangeStatus]);

  const confirmUpdating =
    Boolean(statusUpdatePending) &&
    Boolean(pending) &&
    statusUpdateForBookingId === pending?.booking.id;

  const handleCancelStatus = useCallback(() => setPending(null), []);

  return (
    <>
      <StatusChangeConfirmModal
        open={Boolean(pending)}
        guestName={pending?.booking.guestName ?? ''}
        currentLabel={
          pending
            ? statusLabel[parseBookingStatus(pending.booking.status)]
            : ''
        }
        nextLabel={pending ? statusLabel[pending.nextStatus] : ''}
        onConfirm={() => void handleConfirmStatus()}
        onCancel={handleCancelStatus}
        isUpdating={confirmUpdating}
      />
      {/* Mobile: cards */}
      <ul className="grid gap-4 md:hidden">
        {bookings.map((row) => {
          const status = parseBookingStatus(row.status);
          return (
          <li
            key={row.id}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{row.guestName}</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  {row.propertyName}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[status]}`}
              >
                {statusLabel[status]}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Check-in
                </dt>
                <dd className="mt-0.5 font-medium text-slate-800">
                  {formatDate(row.checkIn)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Check-out
                </dt>
                <dd className="mt-0.5 font-medium text-slate-800">
                  {formatDate(row.checkOut)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total
                </dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
                  {money.format(row.totalAmount)}
                </dd>
              </div>
            </dl>
            {onChangeStatus && !isTerminalBookingStatus(status) ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Update status
                </p>
                <StatusSelect
                  row={row}
                  onSelectNextStatus={handleSelectNextStatus}
                  disabled={
                    statusUpdatePending &&
                    statusUpdateForBookingId === row.id
                  }
                />
              </div>
            ) : null}
          </li>
          );
        })}
      </ul>

      {/* Desktop: table — explicit column mins prevent header text from colliding */}
      <div className="hidden w-full md:block">
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/50">
          <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/95">
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                >
                  Guest
                </th>
                <th
                  scope="col"
                  className="min-w-40 whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                >
                  Property
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                >
                  Check-in
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                >
                  Check-out
                </th>
                <th
                  scope="col"
                  className="min-w-34 whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="min-w-30 whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                >
                  <span className="inline-block">Total</span>
                </th>
                {onChangeStatus ? (
                  <th
                    scope="col"
                    className="min-w-52 whitespace-nowrap border-l border-slate-200/80 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                  >
                    <span className="inline-block">Update</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {bookings.map((row, index) => {
                const status = parseBookingStatus(row.status);
                return (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 transition hover:bg-indigo-50/40 ${index === bookings.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900 sm:px-5">
                    {row.guestName}
                  </td>
                  <td className="max-w-[220px] px-4 py-4 text-slate-700 sm:px-5">
                    <span className="line-clamp-2">{row.propertyName}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-700 sm:px-5">
                    {formatDate(row.checkIn)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-700 sm:px-5">
                    {formatDate(row.checkOut)}
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[status]}`}
                    >
                      {statusLabel[status]}
                    </span>
                  </td>
                  <td className="min-w-30 whitespace-nowrap px-4 py-4 text-right text-base font-semibold tabular-nums text-slate-900 sm:px-5">
                    {money.format(row.totalAmount)}
                  </td>
                  {onChangeStatus ? (
                    <td className="min-w-52 border-l border-slate-100 px-4 py-4 align-middle sm:px-5">
                      {!isTerminalBookingStatus(status) ? (
                        <StatusSelect
                          row={row}
                          onSelectNextStatus={handleSelectNextStatus}
                          disabled={
                            statusUpdatePending &&
                            statusUpdateForBookingId === row.id
                          }
                        />
                      ) : null}
                    </td>
                  ) : null}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
