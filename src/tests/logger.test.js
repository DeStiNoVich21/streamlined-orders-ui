import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logActivity } from '../utils/logger';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('logger', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('должен показывать toast уведомление', () => {
    logActivity('Создание', 'Товар: iPhone 15', 123);

    expect(toast.success).toHaveBeenCalledWith(
      'Создание: Товар: iPhone 15',
      expect.any(Object)
    );
  });

  it('должен сохранять лог в localStorage', () => {
    logActivity('Удаление', 'Заказ #5', 5);

    const logs = JSON.parse(localStorage.getItem('activityLogs'));
    
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('Удаление');
    expect(logs[0].entityName).toBe('Заказ #5');
    expect(logs[0].entityId).toBe(5);
  });

  it('должен добавлять новые логи в начало массива', () => {
    logActivity('Создание', 'Товар 1');
    logActivity('Обновление', 'Товар 2');

    const logs = JSON.parse(localStorage.getItem('activityLogs'));
    
    expect(logs[0].entityName).toBe('Товар 2');
    expect(logs[1].entityName).toBe('Товар 1');
  });

  it('должен использовать userName из localStorage', () => {
    localStorage.setItem('userName', 'TestAdmin');
    
    logActivity('Создание', 'Тест');
    
    const logs = JSON.parse(localStorage.getItem('activityLogs'));
    expect(logs[0].userName).toBe('TestAdmin');
  });

  it('должен использовать Admin по умолчанию если userName нет', () => {
    logActivity('Создание', 'Тест');
    
    const logs = JSON.parse(localStorage.getItem('activityLogs'));
    expect(logs[0].userName).toBe('Admin');
  });
});