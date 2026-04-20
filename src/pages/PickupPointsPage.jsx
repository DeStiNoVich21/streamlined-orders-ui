import { useEffect, useState, useMemo } from 'react';
import api from '../api/axiosInstance';
import { PickupPointModal } from '../components/PickupPointModal';

export const PickupPointsPage = () => {
    const [points, setPoints] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Пункты выдачи обычно содержат больше текста, сделаем по 6

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pickuppoints');
            setPoints(res.data.$values || res.data || []);
        } catch (err) {
            console.error("Ошибка загрузки точек:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPoints(); }, []);

    const filteredPoints = useMemo(() => {
        return points.filter(p => 
            p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.managerName && p.managerName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [points, searchQuery]);

    const handleDelete = async (id) => {
        if (window.confirm("Удалить этот пункт выдачи?")) {
            try {
                await api.delete(`/pickuppoints/${id}`);
                setPoints(points.filter(p => p.pointId !== id));
            } catch (err) {
                alert("Ошибка при удалении.");
            }
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const currentItems = filteredPoints.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredPoints.length / itemsPerPage);

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Пункты выдачи</h2>
                        <p className="text-gray-500 text-sm font-medium">Всего локаций: {filteredPoints.length}</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <input 
                            type="text" 
                            placeholder="Поиск по адресу или менеджеру..." 
                            className="flex-1 md:w-80 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                        />
                        <button 
                            onClick={() => { setSelectedPoint(null); setIsModalOpen(true); }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            + Добавить пункт
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Загрузка локаций...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {currentItems.map(p => (
                            <div key={p.pointId} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                <div className="h-24 bg-slate-100 flex items-center px-8 relative">
                                    <span className="text-4xl">📍</span>
                                    <div className="ml-4">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ID #{p.pointId}</p>
                                        <p className="text-sm font-bold text-gray-400">{p.openingHours || 'Часы не указаны'}</p>
                                    </div>
                                </div>
                                
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="font-extrabold text-xl text-gray-900 mb-4 min-h-[3.5rem] line-clamp-2 italic">
                                        {p.address}
                                    </h3>
                                    
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <span className="text-gray-400">👤</span>
                                            <span className="text-sm font-semibold">{p.managerName || 'Менеджер не назначен'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-auto pt-6 border-t border-gray-50">
                                        <button 
                                            onClick={() => { setSelectedPoint(p); setIsModalOpen(true); }}
                                            className="flex-[3] bg-slate-900 text-white hover:bg-blue-600 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-gray-100"
                                        >
                                            ✏️ Редактировать
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p.pointId)}
                                            className="flex-1 bg-gray-50 hover:bg-red-50 text-red-500 py-3.5 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Пагинация */}
{totalPages > 1 && (
    <div className="flex justify-center items-center gap-3 pt-10 pb-10">
        {/* Кнопка Назад */}
        <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                currentPage === 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
            }`}
        >
            ← <span className="hidden sm:inline">Назад</span>
        </button>

        {/* Номера страниц */}
        <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                        currentPage === i + 1 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' 
                        : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                    }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>

        {/* Кнопка Вперёд */}
        <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                currentPage === totalPages 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
            }`}
        >
            <span className="hidden sm:inline">Вперёд</span> →
        </button>
    </div>
)}
                </>
            )}

            <PickupPointModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                point={selectedPoint}
                onSave={fetchPoints} 
            />
        </div>
    );
};