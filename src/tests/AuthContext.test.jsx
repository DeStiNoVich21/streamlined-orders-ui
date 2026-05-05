import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';

// Мокаем authService
vi.mock('../api/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}));

describe('AuthContext', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('должен инициализироваться с null user', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('должен загружать пользователя из localStorage', async () => {
    const mockUser = { username: 'testuser', role: 'Admin' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    
  });

  it('должен успешно логинить пользователя', async () => {
    const mockUser = { username: 'admin', role: 'Admin' };
    const mockResponse = { user: mockUser, token: 'fake-token' };
    
    authService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('admin', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(authService.login).toHaveBeenCalledWith('admin', 'password');
  });

  it('должен очищать пользователя при logout', async () => {
    const mockUser = { username: 'admin', role: 'Admin' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});