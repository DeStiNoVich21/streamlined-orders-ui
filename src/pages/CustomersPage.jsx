import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchCustomers = async (query = '') => {
        setLoading(true);
        try {
            const url = query ? `/customers/search?query=${query}` : '/customers';
            const res = await api.get(url);
            setCustomers(res.data);
        } catch (err) {
            console.error("Ошибка загрузки:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">База клиентов</h2>
                <div className="flex w-full md:w-auto gap-2">
                    <input 
                        type="text" 
                        placeholder="Поиск по имени..." 
                        className="flex-1 md:w-80 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                        onClick={() => fetchCustomers(searchQuery)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Найти
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 italic text-gray-500">Загрузка клиентов...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {customers.map(c => (
                        <div key={c.customerId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">👤</div>
                                <span className="text-xs font-mono text-gray-400">ID: {c.customerId}</span>
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-1">{c.fullName}</h3>
                            <p className="text-sm text-gray-600 mb-1">📧 {c.email || '—'}</p>
                            <p className="text-sm text-gray-600">📞 {c.phone || '—'}</p>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Адрес</p>
                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                    {c.address || 'Адрес не указан'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};