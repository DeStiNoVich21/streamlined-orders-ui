import { useState, useMemo } from 'react';

export const useProductFilters = (products) => {
    // Состояния фильтров
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('none');
    const [stockFilter, setStockFilter] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Функция сброса
    const resetFilters = () => {
        setSearchQuery('');
        setSortBy('none');
        setStockFilter('all');
        setPriceRange({ min: '', max: '' });
    };

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // 1. Поиск по названию
        if (searchQuery) {
            result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // 2. Фильтр по наличию
        if (stockFilter === 'in-stock') {
            result = result.filter(p => p.stockQuantity > 0);
        } else if (stockFilter === 'out-of-stock') {
            result = result.filter(p => p.stockQuantity <= 0);
        }

        // 3. Фильтр по цене (Price Range)
        if (priceRange.min !== '') {
            result = result.filter(p => p.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max !== '') {
            result = result.filter(p => p.price <= parseFloat(priceRange.max));
        }

        // 4. Сортировка
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'stock-asc': return a.stockQuantity - b.stockQuantity;
                case 'stock-desc': return b.stockQuantity - a.stockQuantity;
                default: return 0;
            }
        });

        return result;
    }, [products, searchQuery, sortBy, stockFilter, priceRange]);

    return {
        filters: { searchQuery, sortBy, stockFilter, priceRange },
        setSearchQuery,
        setSortBy,
        setStockFilter,
        setPriceRange,
        resetFilters,
        filteredProducts: filteredAndSortedProducts
    };
};