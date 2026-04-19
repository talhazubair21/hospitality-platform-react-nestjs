import { isAxiosError } from 'axios';
import { apiBaseUrl } from './client';

/** True when the request never reached a valid HTTP response (offline, wrong host, CORS, refused connection, timeout). */
export function isLikelyNetworkFailure(error: unknown): boolean {
  if (isAxiosError(error)) {
    if (error.response) {
      return false;
    }
    const code = error.code;
    if (code === 'ERR_NETWORK' || code === 'ECONNABORTED') {
      return true;
    }
    // Request was sent but no response (typical for connection refused / DNS / CORS preflight failure)
    if (error.request) {
      return true;
    }
  }
  return false;
}

function extractServerMessage(error: unknown): string | null {
  if (!isAxiosError(error)) {
    return null;
  }
  const data = error.response?.data as
    | { message?: string | string[] }
    | undefined;
  const msg = data?.message;
  if (Array.isArray(msg)) {
    const joined = msg.join(', ').trim();
    return joined || null;
  }
  if (typeof msg === 'string' && msg.trim()) {
    return msg.trim();
  }
  return null;
}

/** User-facing message from server body, axios, or fallback. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const fromServer = extractServerMessage(error);
  if (fromServer) {
    return fromServer;
  }
  if (isAxiosError(error) && error.message?.trim()) {
    return error.message.trim();
  }
  if (error instanceof Error && error.message?.trim()) {
    return error.message.trim();
  }
  return fallback;
}

export type BookingsListErrorPanel = {
  title: string;
  description: string;
  hint: string;
};

export function getBookingsListErrorPanel(
  error: unknown,
): BookingsListErrorPanel {
  if (isLikelyNetworkFailure(error)) {
    return {
      title: "We can't reach the bookings API",
      description:
        'No response came back from the server. That usually means the backend is not running, the URL is wrong, or something on the network blocked the request.',
      hint: `This app calls ${apiBaseUrl}. To use another host or port, set VITE_API_URL in a .env file at the project root, then restart the Vite dev server.`,
    };
  }

  const status = isAxiosError(error) ? error.response?.status : undefined;
  const serverMsg = extractServerMessage(error);

  if (status === 401 || status === 403) {
    return {
      title: 'Access was denied',
      description:
        serverMsg ??
        'The server rejected this request. You may need to sign in or your account may not have permission to load bookings.',
      hint: 'If this is unexpected, check API authentication settings on the server.',
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      title: 'The server had a problem',
      description:
        serverMsg ??
        'The bookings service returned an error while loading your list. This is usually temporary.',
      hint: 'Wait a moment and try again. If it keeps happening, check the API logs.',
    };
  }

  if (status !== undefined && status >= 400) {
    return {
      title: "This request couldn't be completed",
      description:
        serverMsg ?? 'The server could not return bookings for this request.',
      hint: `Request failed with HTTP ${status}. Adjust filters or try again.`,
    };
  }

  return {
    title: 'Bookings could not be loaded',
    description: getApiErrorMessage(
      error,
      'Something went wrong while loading bookings.',
    ),
    hint: `Using API base URL: ${apiBaseUrl}.`,
  };
}

export function toastMessageForBookingsListError(error: unknown): string {
  if (isLikelyNetworkFailure(error)) {
    return `Can't reach the server at ${apiBaseUrl}. Start the API or fix VITE_API_URL, then try again.`;
  }
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const serverMsg = extractServerMessage(error);

  if (status !== undefined && status >= 500) {
    return serverMsg
      ? `Server error (${status}): ${serverMsg}`
      : 'The server had a problem loading bookings. Please try again shortly.';
  }

  if (status === 401 || status === 403) {
    return serverMsg ?? "You don't have permission to load bookings.";
  }

  if (status !== undefined && status >= 400) {
    return serverMsg ?? `Couldn't load bookings (error ${status}).`;
  }

  return getApiErrorMessage(
    error,
    'Could not load bookings. Please try again.',
  );
}

type MutationKind = 'create' | 'updateStatus';

export function toastMessageForBookingMutation(
  kind: MutationKind,
  error: unknown,
): string {
  if (isLikelyNetworkFailure(error)) {
    if (kind === 'create') {
      return `Can't reach the server at ${apiBaseUrl}, so your booking wasn't saved. Start the API or fix VITE_API_URL, then try again.`;
    }
    return `Can't reach the server at ${apiBaseUrl}, so the status wasn't updated. Start the API or fix VITE_API_URL, then try again.`;
  }

  const status = isAxiosError(error) ? error.response?.status : undefined;
  const serverMsg = extractServerMessage(error);

  if (status !== undefined && status >= 500) {
    const prefix = kind === 'create' ? 'Saving the booking' : 'Updating status';
    return serverMsg
      ? `${prefix} failed (${status}): ${serverMsg}`
      : `${prefix} failed because of a server error. Try again in a moment.`;
  }

  if (status === 401 || status === 403) {
    return serverMsg ?? "You don't have permission to perform this action.";
  }

  if (kind === 'create') {
    return getApiErrorMessage(
      error,
      "Couldn't create the booking. Please try again.",
    );
  }
  return getApiErrorMessage(
    error,
    "Couldn't update the booking status. Please try again.",
  );
}
