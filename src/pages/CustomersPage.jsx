import { useEffect, useState, useMemo } from 'react';
import api from '../api/axiosInstance';
import { CreateCustomerModal } from '../components/CreateCustomerModal';
import { EditCustomerModal } from '../components/EditCustomerModal';
// --- ИМПОРТЫ ДЛЯ ЛОГИРОВАНИЯ И ЭКСПОРТА ---
import { logActivity } from '../utils/logger';
import { downloadCSV } from '../utils/exportUtils';

export const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [sortBy, setSortBy] = useState('name-asc'); 
    const [dataFilter, setDataFilter] = useState('all'); 

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchCustomers = async (query = '') => {
        setLoading(true);
        try {
            const url = query ? `/customers/search?query=${query}` : '/customers';
            const res = await api.get(url);
            const data = res.data.$values || res.data || [];
            setCustomers(data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Ошибка загрузки:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const filteredAndSortedCustomers = useMemo(() => {
        let result = [...customers];
        if (dataFilter === 'no-phone') {
            result = result.filter(c => !c.phone || c.phone.trim() === '');
        } else if (dataFilter === 'no-email') {
            result = result.filter(c => !c.email || c.email.trim() === '');
        }
        result.sort((a, b) => {
            const nameA = a.fullName.toLowerCase();
            const nameB = b.fullName.toLowerCase();
            if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
            if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
            return 0;
        });
        return result;
    }, [customers, sortBy, dataFilter]);

    // --- ОБЕРТКИ С ЛОГИРОВАНИЕМ ---
    const handleCreated = () => {
        fetchCustomers();
        logActivity('Клиенты', 'Создан новый клиент');
    };

    const handleUpdated = () => {
        fetchCustomers();
        logActivity('Клиенты', `Обновлены данные клиента ID: ${editingCustomerId}`);
    };

    const handleDeleted = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этого клиента?")) {
            try {
                await api.delete(`/customers/${id}`);
                setCustomers(customers.filter(c => c.customerId !== id));
                logActivity('Клиенты', `Удален клиент ID: ${id}`);
            } catch (err) {
                alert("Ошибка при удалении. Возможно, у клиента есть активные заказы.");
            }
        }
    };

    const handleExport = () => {
        if (filteredAndSortedCustomers.length === 0) return;
        downloadCSV(filteredAndSortedCustomers, 'customers_report.csv');
        logActivity('Экспорт', `Экспорт списка клиентов (${filteredAndSortedCustomers.length} чел.)`);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const currentCustomers = filteredAndSortedCustomers.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">База клиентов</h2>
                        <p className="text-gray-500 text-sm font-medium">Найдено: {filteredAndSortedCustomers.length}</p>
                    </div>
                    
                    <div className="flex w-full md:w-auto gap-2">
                        <button 
                            onClick={handleExport}
                            className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition font-bold border border-emerald-100"
                            title="Экспорт в CSV"
                        >
                            📥 CSV
                        </button>
                        <div className="relative flex-1 md:w-64">
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Поиск по имени..." 
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchCustomers(searchQuery)}
                            />
                        </div>
                        <button 
                            onClick={() => fetchCustomers(searchQuery)}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition font-bold active:scale-95"
                        >
                            Найти
                        </button>
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            + Новый
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Алфавит:</span>
                        <select 
                            className="bg-gray-50 border-none rounded-lg text-sm font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name-asc">А — Я</option>
                            <option value="name-desc">Я — А</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Проверка данных:</span>
                        <select 
                            className="bg-gray-50 border-none rounded-lg text-sm font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={dataFilter}
                            onChange={(e) => {setDataFilter(e.target.value); setCurrentPage(1);}}
                        >
                            <option value="all">Все клиенты</option>
                            <option value="no-phone">Без телефона</option>
                            <option value="no-email">Без почты</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 animate-pulse italic text-gray-400">
                    Загрузка клиентов...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentCustomers.map(c => (
                            <div key={c.customerId} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group relative flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        👤
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button 
                                            onClick={() => setEditingCustomerId(c.customerId)}
                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                            title="Изменить"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => handleDeleted(c.customerId)}
                                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-xl text-gray-900 mb-2 truncate">
                                    {c.fullName}
                                </h3>
                                
                                <div className="space-y-1.5 mb-6 flex-1">
                                    <p className={`text-sm flex items-center gap-2 ${!c.email ? 'text-red-400 italic' : 'text-gray-600'}`}>
                                        <span className="opacity-40 font-normal">📧</span> 
                                        <span className="truncate">{c.email || 'Почта не указана'}</span>
                                    </p>
                                    <p className={`text-sm flex items-center gap-2 ${!c.phone ? 'text-red-400 italic' : 'text-gray-600'}`}>
                                        <span className="opacity-40 font-normal">📞</span> 
                                        <span>{c.phone || 'Телефон не указан'}</span>
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-50 bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-3xl">
                                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1.5 tracking-widest">Адрес</p>
                                    <p className="text-xs text-gray-700 leading-relaxed italic line-clamp-2 min-h-[2.5rem]">
                                        {c.address || 'Адрес не указан'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 pt-8 pb-10">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-sm hover:border-blue-300 transition-all shadow-sm active:scale-95"
                            >
                                ← Назад
                            </button>
                            
                            <div className="flex gap-1.5">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-11 h-11 rounded-xl font-black text-sm transition-all shadow-sm ${
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
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-sm hover:border-blue-300 transition-all shadow-sm active:scale-95"
                            >
                                Вперед →
                            </button>
                        </div>
                    )}
                </>
            )}

            <CreateCustomerModal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                onCustomerCreated={handleCreated} 
            />
            
            <EditCustomerModal 
                isOpen={!!editingCustomerId} 
                customerId={editingCustomerId} 
                onClose={() => setEditingCustomerId(null)} 
                onCustomerUpdated={handleUpdated} 
            />
        </div>
    );
};