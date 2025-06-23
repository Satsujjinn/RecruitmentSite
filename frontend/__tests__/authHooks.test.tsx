import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../lib/auth';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('auth hooks (mock)', () => {
  it('login sets user and token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.login('test@example.com', 'pass', 'athlete'));
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.token).toBe('mock-token');
  });

  it('signup stores user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.signup('Test', 'new@example.com', 'pw', 'athlete'));
    expect(result.current.user?.name).toBe('Test');
  });

  it('subscribe updates subscription', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.login('test@example.com', 'pass', 'athlete'));
    await act(() => result.current.subscribe());
    expect(result.current.user?.isSubscribed).toBe(true);
  });

  it('logout clears auth data', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.login('test@example.com', 'pass', 'athlete'));
    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});
