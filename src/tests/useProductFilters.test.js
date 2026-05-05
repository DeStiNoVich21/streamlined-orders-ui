import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProductFilters } from '../hooks/useProductFilters';

describe('useProductFilters', () => {
  const mockProducts = [
    { productId: 1, title: 'iPhone 15', price: 80000, stockQuantity: 5 },
    { productId: 2, title: 'Samsung Galaxy', price: 60000, stockQuantity: 0 },
    { productId: 3, title: 'Xiaomi Redmi', price: 25000, stockQuantity: 10 },
  ];

  it('должен фильтровать по поисковому запросу', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setSearchQuery('iPhone');
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].title).toBe('iPhone 15');
  });

  it('должен фильтровать товары в наличии', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setStockFilter('in-stock');
    });

    expect(result.current.filteredProducts).toHaveLength(2);
    expect(result.current.filteredProducts.every(p => p.stockQuantity > 0)).toBe(true);
  });

  it('должен фильтровать товары не в наличии', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setStockFilter('out-of-stock');
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].stockQuantity).toBe(0);
  });

  it('должен сортировать по возрастанию цены', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setSortBy('price-asc');
    });

    const prices = result.current.filteredProducts.map(p => p.price);
    expect(prices).toEqual([25000, 60000, 80000]);
  });

  it('должен сортировать по убыванию цены', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setSortBy('price-desc');
    });

    const prices = result.current.filteredProducts.map(p => p.price);
    expect(prices).toEqual([80000, 60000, 25000]);
  });

  it('должен фильтровать по диапазону цен', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setPriceRange({ min: '30000', max: '70000' });
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].price).toBe(60000);
  });

  it('должен сбрасывать все фильтры', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setSearchQuery('iPhone');
      result.current.setStockFilter('in-stock');
      result.current.setSortBy('price-desc');
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters.searchQuery).toBe('');
    expect(result.current.filters.stockFilter).toBe('all');
    expect(result.current.filters.sortBy).toBe('none');
    expect(result.current.filteredProducts).toHaveLength(3);
  });

  it('должен комбинировать несколько фильтров', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    act(() => {
      result.current.setSearchQuery('Samsung');
      result.current.setStockFilter('out-of-stock');
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].title).toBe('Samsung Galaxy');
  });
});