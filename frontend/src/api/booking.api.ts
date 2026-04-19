import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Booking, BookingApi, BookingStatus } from '../types/booking';
import { bookingFromApi } from '../types/booking';
import { apiClient } from './client';
import {
  isLikelyNetworkFailure,
  toastMessageForBookingMutation,
  toastMessageForBookingsListError,
} from './errors';

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (status?: string) =>
    [...bookingKeys.all, 'list', status ?? 'all'] as const,
};

type RawBooking = {
  _id: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeBooking(raw: RawBooking): Booking {
  const api: BookingApi = {
    id: String(raw._id),
    guestName: raw.guestName,
    propertyName: raw.propertyName,
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
    status: raw.status,
    totalAmount: raw.totalAmount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
  return bookingFromApi(api);
}

export async function fetchBookings(status?: string): Promise<Booking[]> {
  const params = status ? { status } : {};
  const { data } = await apiClient.get<RawBooking[]>('/bookings', { params });
  return data.map(normalizeBooking);
}

export type CreateBookingPayload = {
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
};

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const { data } = await apiClient.post<RawBooking>('/bookings', payload);
  return normalizeBooking(data);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  const { data } = await apiClient.patch<RawBooking>(
    `/bookings/${id}/status`,
    { status },
  );
  return normalizeBooking(data);
}

type BookingsQueryOptions = Omit<
  UseQueryOptions<Booking[], Error, Booking[], ReturnType<typeof bookingKeys.list>>,
  'queryKey' | 'queryFn'
>;

export function useBookingsQuery(
  statusFilter: string,
  options?: BookingsQueryOptions,
) {
  const status = statusFilter.trim() || undefined;

  return useQuery({
    queryKey: bookingKeys.list(status),
    retry: false,
    queryFn: async () => {
      try {
        return await fetchBookings(status);
      } catch (error) {
        toast.error(toastMessageForBookingsListError(error), {
          duration: isLikelyNetworkFailure(error) ? 8000 : 5000,
          id: 'bookings-list-fetch',
        });
        throw error;
      }
    },
    ...options,
  });
}

type CreateMutationOptions = Omit<
  UseMutationOptions<Booking, Error, CreateBookingPayload>,
  'mutationFn'
>;

export function useCreateBookingMutation(options?: CreateMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createBooking,
    onSuccess: (data, variables, onMutateResult, context) => {
      toast.success('Booking created successfully.');
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(toastMessageForBookingMutation('create', error), {
        duration: isLikelyNetworkFailure(error) ? 8000 : 5000,
      });
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

type UpdateStatusVars = { id: string; status: BookingStatus };

type UpdateMutationOptions = Omit<
  UseMutationOptions<Booking, Error, UpdateStatusVars>,
  'mutationFn'
>;

export function useUpdateBookingStatusMutation(
  options?: UpdateMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, status }: UpdateStatusVars) =>
      updateBookingStatus(id, status),
    onSuccess: (data, variables, onMutateResult, context) => {
      toast.success('Booking status updated.');
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(toastMessageForBookingMutation('updateStatus', error), {
        duration: isLikelyNetworkFailure(error) ? 8000 : 5000,
      });
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}
