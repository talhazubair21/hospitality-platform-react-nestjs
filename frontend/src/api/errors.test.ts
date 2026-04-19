import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  getApiErrorMessage,
  getBookingsListErrorPanel,
  isLikelyNetworkFailure,
  toastMessageForBookingsListError,
} from './errors';

function axiosErr(
  partial: Partial<AxiosError> & { message?: string },
): AxiosError {
  const e = new AxiosError(
    partial.message ?? 'Error',
    partial.code,
    partial.config,
    partial.request,
    partial.response,
  );
  return e;
}

describe('isLikelyNetworkFailure', () => {
  it('returns true when there is no response (network)', () => {
    const err = axiosErr({
      code: 'ERR_NETWORK',
      request: {},
    });
    expect(isLikelyNetworkFailure(err)).toBe(true);
  });

  it('returns false when a response exists', () => {
    const err = axiosErr({
      response: {
        status: 500,
        data: {},
        statusText: 'Error',
        headers: {},
        config: {} as AxiosError['config'],
      },
    });
    expect(isLikelyNetworkFailure(err)).toBe(false);
  });
});

describe('getApiErrorMessage', () => {
  it('prefers server validation message array', () => {
    const err = axiosErr({
      response: {
        status: 400,
        data: { message: ['guestName must not be empty'] },
        statusText: 'Bad Request',
        headers: {},
        config: {} as AxiosError['config'],
      },
    });
    expect(getApiErrorMessage(err, 'fallback')).toBe(
      'guestName must not be empty',
    );
  });
});

describe('getBookingsListErrorPanel', () => {
  it('returns network-oriented copy when offline', () => {
    const panel = getBookingsListErrorPanel(
      axiosErr({ code: 'ERR_NETWORK', request: {} }),
    );
    expect(panel.title).toContain('reach');
  });
});

describe('toastMessageForBookingsListError', () => {
  it('mentions API URL for network failures', () => {
    const msg = toastMessageForBookingsListError(
      axiosErr({ code: 'ERR_NETWORK', request: {} }),
    );
    expect(msg).toMatch(/VITE_API_URL|localhost/);
  });
});
