import { useEffect, useState, useMemo } from 'react'; // Добавили useMemo для оптимизации
import api from '../api/axiosInstance';
import { ProductModal } from '../components/ProductModal';

export const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // --- НОВЫЕ СОСТОЯНИЯ ФИЛЬТРОВ ---
    const [sortBy, setSortBy] = useState('none'); // 'price-asc', 'price-desc', 'stock-asc', 'stock-desc'
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'out-of-stock'

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

    // --- ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ ---
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

        // 3. Сортировка
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
    }, [products, searchQuery, sortBy, stockFilter]);

    const handleDelete = async (id) => {
        if (window.confirm("Удалить этот товар?")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.productId !== id));
            } catch (err) {
                alert("Ошибка удаления");
            }
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

    return (
        <div className="w-full space-y-6">
            {/* Хедер */}
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Каталог товаров</h2>
                        <p className="text-gray-500 text-sm font-medium">Найдено: {filteredAndSortedProducts.length}</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <input 
                            type="text" 
                            placeholder="Поиск товара..." 
                            className="flex-1 md:w-64 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                        />
                        <button 
                            onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            + Добавить
                        </button>
                    </div>
                </div>

                {/* --- ПАНЕЛЬ ФИЛЬТРОВ --- */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Сортировка:</span>
                        <select 
                            className="bg-gray-50 border-none rounded-lg text-sm font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="none">По умолчанию</option>
                            <option value="price-asc">Цена: Дешевле</option>
                            <option value="price-desc">Цена: Дороже</option>
                            <option value="stock-asc">Склад: Меньше</option>
                            <option value="stock-desc">Склад: Больше</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Наличие:</span>
                        <select 
                            className="bg-gray-50 border-none rounded-lg text-sm font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={stockFilter}
                            onChange={(e) => {setStockFilter(e.target.value); setCurrentPage(1);}}
                        >
                            <option value="all">Все товары</option>
                            <option value="in-stock">В наличии</option>
                            <option value="out-of-stock">Нет на складе</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Сетка товаров */}
            {loading ? (
                <div className="text-center py-20 italic text-gray-400">Загрузка каталога...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentProducts.map(p => (
                            <div key={p.productId} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col relative">
                                {/* Бейджик отсутствия товара */}
                                {p.stockQuantity <= 0 && (
                                    <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase">
                                        Нет в наличии
                                    </div>
                                )}
                                
                                <div className="h-48 bg-gray-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                                    📦
                                </div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900 leading-tight truncate pr-2">{p.title}</h3>
                                        <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-xs font-black">
                                            ${p.price}
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1 italic">
                                        {p.description || "Описание не заполнено."}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">На складе</p>
                                            <p className={`text-sm font-bold ${p.stockQuantity > 0 ? 'text-gray-700' : 'text-red-500 animate-pulse'}`}>
                                                {p.stockQuantity} шт.
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }}
                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                title="Редактировать"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.productId)}
                                                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                                title="Удалить"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 pt-8 pb-10">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-sm text-gray-600 hover:border-blue-300 transition-all shadow-sm"
                            >
                                ← Назад
                            </button>
                            
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                            currentPage === i + 1 
                                            ? 'bg-blue-600 text-white shadow-blue-200 scale-110' 
                                            : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-sm text-gray-600 hover:border-blue-300 transition-all shadow-sm"
                            >
                                Вперед →
                            </button>
                        </div>
                    )}
                </>
            )}

            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct}
                onSave={fetchProducts} 
            />
        </div>
    );
};