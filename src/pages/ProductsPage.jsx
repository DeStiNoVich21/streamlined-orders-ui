import { useEffect, useState, useMemo } from 'react';
import api from '../api/axiosInstance';
import { ProductModal } from '../components/ProductModal';
// --- ИМПОРТЫ ДЛЯ ЛАБЫ 14 ---
import { logActivity } from '../utils/logger'; 
import { downloadCSV } from '../utils/exportUtils';

export const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // --- СОСТОЯНИЯ ФИЛЬТРОВ (Lab 12) ---
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'out-of-stock'
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('none');

    // Состояния модалки и пагинации
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            const data = res.data.$values || res.data || [];
            setProducts(data);
        } catch (err) {
            console.error("Ошибка загрузки:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // --- ФУНКЦИЯ СБРОСА ФИЛЬТРОВ (Lab 12 Task) ---
    const resetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('All');
        setStockFilter('all');
        setPriceRange({ min: '', max: '' });
        setSortBy('none');
        setCurrentPage(1);
    };

    // --- ФУНКЦИЯ ЭКСПОРТА (Lab 14 Task 2) ---
    const handleExportCSV = () => {
        if (filteredAndSortedProducts.length === 0) return;
        downloadCSV(filteredAndSortedProducts, 'products_catalog.csv');
        logActivity('Экспорт', `Каталог товаров (${filteredAndSortedProducts.length} шт.)`);
    };

    // --- ЛОГИКА РАСШИРЕННОЙ ФИЛЬТРАЦИИ (useMemo) ---
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // 1. Поиск по названию
        if (searchQuery) {
            result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // 2. Фильтр по категории
        if (categoryFilter !== 'All') {
            result = result.filter(p => p.category === categoryFilter);
        }

        // 3. Фильтр по наличию (Stock)
        if (stockFilter === 'in-stock') {
            result = result.filter(p => p.stockQuantity > 0);
        } else if (stockFilter === 'out-of-stock') {
            result = result.filter(p => p.stockQuantity <= 0);
        }

        // 4. Фильтр по диапазону цен (Price Range)
        if (priceRange.min !== '') {
            result = result.filter(p => p.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max !== '') {
            result = result.filter(p => p.price <= parseFloat(priceRange.max));
        }

        // 5. Сортировка
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
    }, [products, searchQuery, categoryFilter, stockFilter, priceRange, sortBy]);

    // Получаем уникальные категории для выпадающего списка
    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return ['All', ...new Set(cats)];
    }, [products]);

    const handleDelete = async (id) => {
        const productToDelete = products.find(p => p.productId === id);
        if (window.confirm(`Удалить товар "${productToDelete?.title}"?`)) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.productId !== id));
                // --- ЛОГИРОВАНИЕ УДАЛЕНИЯ (Lab 14) ---
                logActivity('Удаление', `Товар: ${productToDelete?.title}`, id);
            } catch (err) { alert("Ошибка удаления"); }
        }
    };

    // Callback для сохранения данных (Lab 14)
    const handleOnSave = () => {
        fetchProducts();
        // Логируем успех (типа "Создание/Обновление")
        logActivity(selectedProduct ? 'Изменение' : 'Создание', 'Данные товара обновлены');
    };

    // Логика пагинации
    const indexOfLastItem = currentPage * itemsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

    return (
        <div className="w-full space-y-6">
            {/* Панель управления и фильтров */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Каталог товаров</h2>
                        <p className="text-gray-400 text-sm font-bold">Найдено позиций: {filteredAndSortedProducts.length}</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-3">
                        {/* КНОПКА ЭКСПОРТА (Lab 14 Task 2) */}
                        <button 
                            onClick={handleExportCSV}
                            className="bg-emerald-50 text-emerald-600 px-5 py-3 rounded-2xl font-black hover:bg-emerald-100 transition-all border border-emerald-100"
                        >
                            CSV Экспорт
                        </button>
                        <input 
                            type="text" 
                            placeholder="Поиск по названию..." 
                            className="flex-1 md:w-80 border-2 border-gray-50 bg-gray-50 rounded-2xl px-5 py-3 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                        />
                        <button 
                            onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            + Добавить
                        </button>
                    </div>
                </div>

                {/* БЛОК РАСШИРЕННЫХ ФИЛЬТРОВ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6 border-t border-gray-50 items-end">
                    {/* Категория */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Категория</label>
                        <select 
                            className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            value={categoryFilter}
                            onChange={(e) => {setCategoryFilter(e.target.value); setCurrentPage(1);}}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {/* Наличие */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Склад</label>
                        <select 
                            className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            value={stockFilter}
                            onChange={(e) => {setStockFilter(e.target.value); setCurrentPage(1);}}
                        >
                            <option value="all">Все товары</option>
                            <option value="in-stock">В наличии</option>
                            <option value="out-of-stock">Нет на складе</option>
                        </select>
                    </div>

                    {/* Цена ОТ и ДО */}
                    <div className="space-y-2 lg:col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Цена (от - до)</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="Мин"
                                className="w-full bg-gray-50 rounded-xl text-sm font-bold px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({...prev, min: e.target.value}))}
                            />
                            <input 
                                type="number" 
                                placeholder="Макс"
                                className="w-full bg-gray-50 rounded-xl text-sm font-bold px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({...prev, max: e.target.value}))}
                            />
                        </div>
                    </div>

                    {/* Сортировка */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Сортировка</label>
                        <select 
                            className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="none">По умолчанию</option>
                            <option value="price-asc">Сначала дешевые</option>
                            <option value="price-desc">Сначала дорогие</option>
                            <option value="stock-desc">Много на складе</option>
                        </select>
                    </div>

                    {/* Кнопка сброса */}
                    <button 
                        onClick={resetFilters}
                        className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-xl text-xs font-black transition-colors uppercase tracking-widest"
                    >
                        Сбросить
                    </button>
                </div>
            </div>

            {/* Сетка товаров */}
            {loading ? (
                <div className="text-center py-20 italic text-gray-400">Загрузка каталога...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentProducts.map(p => (
                        <div key={p.productId} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group relative flex flex-col">
                            {p.stockQuantity <= 0 && (
                                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase">
                                    Sold Out
                                </div>
                            )}
                            
                            <div className="h-44 bg-gray-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                                📦
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-black text-gray-900 leading-tight">{p.title}</h3>
                                    <span className="text-blue-600 font-black text-lg">
                                        {p.price?.toLocaleString()} ₽
                                    </span>
                                </div>
                                
                                <p className="text-xs text-gray-400 line-clamp-2 mb-6 italic">
                                    {p.description || "Описание товара временно отсутствует."}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Остаток</span>
                                        <span className={`text-sm font-bold ${p.stockQuantity > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                                            {p.stockQuantity} шт.
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }}
                                            className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p.productId)}
                                            className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-10">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${
                                currentPage === i + 1 
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct}
                onSave={handleOnSave} 
            />
        </div>
    );
};