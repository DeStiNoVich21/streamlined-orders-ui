import { useEffect, useState, useMemo } from 'react';
import api from '../api/axiosInstance';
import { EmployeeModal } from '../components/EmployeeModal';
// --- ИМПОРТЫ ДЛЯ ЛОГИРОВАНИЯ И ЭКСПОРТА ---
import { logActivity } from '../utils/logger';
import { downloadCSV } from '../utils/exportUtils';

export const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Фильтры
    const [sortBy, setSortBy] = useState('name-asc');
    const [titleFilter, setTitleFilter] = useState('all');

    // Модалка
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            const data = res.data.$values || res.data || [];
            setEmployees(data);
        } catch (err) {
            console.error("Ошибка загрузки сотрудников:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    // Логика фильтрации и сортировки
    const filteredEmployees = useMemo(() => {
        let result = [...employees];

        if (searchQuery) {
            result = result.filter(e => e.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (titleFilter !== 'all') {
            result = result.filter(e => e.jobTitle === titleFilter);
        }

        result.sort((a, b) => {
            if (sortBy === 'name-asc') return a.fullName.localeCompare(b.fullName);
            if (sortBy === 'name-desc') return b.fullName.localeCompare(a.fullName);
            return 0;
        });

        return result;
    }, [employees, searchQuery, sortBy, titleFilter]);

    // Список уникальных должностей для фильтра
    const jobTitles = useMemo(() => {
        const titles = employees.map(e => e.jobTitle).filter(Boolean);
        return ['all', ...new Set(titles)];
    }, [employees]);

    // --- ОБЕРТКИ С ЛОГИРОВАНИЕМ ---
    const handleSaveWithLog = () => {
        const action = selectedEmployee ? 'Обновление' : 'Регистрация';
        logActivity('Персонал', `${action} сотрудника: ${selectedEmployee?.fullName || 'Новый профиль'}`);
        fetchEmployees();
    };

    const handleExport = () => {
        if (filteredEmployees.length === 0) return;
        downloadCSV(filteredEmployees, 'employees_report.csv');
        logActivity('Экспорт', `Выгрузка штатного расписания (${filteredEmployees.length} чел.)`);
    };

    const handleDelete = async (emp) => {
        if (!window.confirm(`Удалить сотрудника ${emp.fullName}?`)) return;

        try {
            // 1. Удаляем сотрудника
            await api.delete(`/employees/${emp.employeeId}`);

            // 2. Очищаем его имя из всех точек выдачи (Frontend-way)
            const pointsRes = await api.get('/pickuppoints');
            const allPoints = pointsRes.data.$values || pointsRes.data || [];
            
            for (const point of allPoints) {
                if (point.managerName?.includes(emp.fullName)) {
                    const updatedManagers = point.managerName
                        .split(', ')
                        .filter(name => name !== emp.fullName)
                        .join(', ');
                    
                    await api.put(`/pickuppoints/${point.pointId}`, {
                        ...point,
                        managerName: updatedManagers
                    });
                }
            }
            
            setEmployees(employees.filter(e => e.employeeId !== emp.employeeId));
            // ЛОГИРОВАНИЕ УДАЛЕНИЯ
            logActivity('Персонал', `Удален сотрудник и очищены привязки: ${emp.fullName} (ID: ${emp.employeeId})`);
        } catch (err) {
            alert("Ошибка при синхронизации данных.");
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    return (
        <div className="w-full space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Сотрудники</h2>
                        <p className="text-gray-500 text-sm font-medium">Штат: {filteredEmployees.length} чел.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <button 
                            onClick={handleExport}
                            className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition font-bold border border-emerald-100"
                            title="Экспорт штата в CSV"
                        >
                            📥 CSV
                        </button>
                        <input 
                            type="text" 
                            placeholder="Поиск по ФИО..." 
                            className="flex-1 md:w-64 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                        />
                        <button 
                            onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            + Добавить
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Сортировка:</span>
                        <select 
                            className="bg-gray-50 border-none rounded-lg text-sm font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name-asc">А — Я</option>
                            <option value="name-desc">Я — А</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Должность:</span>
                        <select 
                            className="bg-gray-50 border-none rounded-lg text-sm font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={titleFilter}
                            onChange={(e) => {setTitleFilter(e.target.value); setCurrentPage(1);}}
                        >
                            {jobTitles.map(t => (
                                <option key={t} value={t}>{t === 'all' ? 'Все должности' : t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 italic text-gray-400">Загрузка штата...</div>
            ) : (
                <>
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
    {currentItems.map(e => (
        <div 
            key={e.employeeId} 
            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
        >
            <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl relative">
                <span className="z-10 drop-shadow-lg">👨‍💼</span>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col -mt-8">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm self-start mb-4">
                    <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-[0.1em]">
                        {e.jobTitle || "Сотрудник"}
                    </div>
                </div>
                
                <h3 className="font-extrabold text-2xl text-gray-900 mb-2 leading-tight">
                    {e.fullName}
                </h3>
                
                <div className="flex items-center gap-3 text-gray-500 mb-8">
                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-sm">
                        📞
                    </div>
                    <span className="font-medium text-base tracking-tight">
                        {e.phone || "Контакт не указан"}
                    </span>
                </div>

                <div className="flex gap-3 mt-auto pt-6 border-t border-gray-50">
                    <button 
                        onClick={() => { setSelectedEmployee(e); setIsModalOpen(true); }}
                        className="flex-[2] bg-slate-900 text-white hover:bg-blue-600 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <span>✏️</span> Изменить
                    </button>
                    <button 
                        onClick={() => handleDelete(e)}
                        className="flex-1 bg-gray-50 hover:bg-red-50 text-red-500 py-3.5 rounded-2xl transition-all flex items-center justify-center border border-transparent hover:border-red-100"
                        title="Удалить"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    ))}
</div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 pt-8 pb-10">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-sm text-gray-600 hover:border-blue-300 shadow-sm transition-all"
                            >
                                ← Назад
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-bold text-sm shadow-sm transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-blue-600 text-white scale-110' 
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
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-sm text-gray-600 hover:border-blue-300 shadow-sm transition-all"
                            >
                                Вперед →
                            </button>
                        </div>
                    )}
                </>
            )}

            <EmployeeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                employee={selectedEmployee}
                onSave={handleSaveWithLog} 
            />
        </div>
    );
};