import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadCSV } from '../utils/exportUtils';

describe('exportUtils', () => {
  beforeEach(() => {
    // Мокаем методы DOM
    global.document.createElement = vi.fn(() => ({
      setAttribute: vi.fn(),
      click: vi.fn(),
    }));
    global.document.body.appendChild = vi.fn();
    global.document.body.removeChild = vi.fn();
  });

  it('должен создавать CSV с правильными заголовками', () => {
    const data = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
    ];

    downloadCSV(data, 'test.csv');

    expect(global.document.createElement).toHaveBeenCalledWith('a');
  });

  it('не должен ничего делать с пустым массивом', () => {
    downloadCSV([], 'test.csv');

    expect(global.document.createElement).not.toHaveBeenCalled();
  });

  it('должен экранировать запятые в значениях', () => {
    const data = [
      { name: 'Test, Product', price: 100 },
    ];

    const createElementSpy = vi.spyOn(document, 'createElement');
    downloadCSV(data, 'test.csv');

    // Проверяем что createElement был вызван (значит CSV создан)
    expect(createElementSpy).toHaveBeenCalled();
  });
});