import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosInstance';

export const PickupPointModal = ({ isOpen, onClose, point, onSave }) => {
    const [allEmployees, setAllEmployees] = useState([]);
    const [formData, setFormData] = useState({
        address: '',
        managerName: '', // Оставляем для совместимости с вашей таблицей PickupPoint
        openingHours: ''
    });

    // Состояние для отслеживания изменений в штате локально до нажатия "Сохранить"
    const [initialPointEmployees, setInitialPointEmployees] = useState([]);
    const [currentPointEmployees, setCurrentPointEmployees] = useState([]);

    useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await api.get('/employees');
            const emps = res.data.$values || res.data || [];
            setAllEmployees(emps);
            
            if (point) {
                // ВАЖНО: Приводим к Number, чтобы избежать проблем сравнения "1" === 1
                const targetPointId = Number(point.pointId);
                
                // Фильтруем сотрудников
                const assigned = emps.filter(e => Number(e.pointId) === targetPointId);
                
                console.log("Текущая точка ID:", targetPointId);
                console.log("Найдено сотрудников для этой точки:", assigned);

                setInitialPointEmployees(assigned);
                setCurrentPointEmployees(assigned);
            }
        } catch (err) { 
            console.error("Ошибка загрузки:", err); 
        }
    };

    if (isOpen) {
        fetchData();
        if (point) {
            setFormData({
                address: point.address || '',
                managerName: point.managerName || '',
                openingHours: point.openingHours || ''
            });
        } else {
            setFormData({ address: '', managerName: '', openingHours: '' });
            setCurrentPointEmployees([]);
            setInitialPointEmployees([]);
        }
    }
}, [point, isOpen]);

    // Список сотрудников, которых можно добавить (те, кто еще не на этой точке)
    const availableEmployees = useMemo(() => {
        return allEmployees.filter(emp => 
            !currentPointEmployees.find(curr => curr.employeeId === emp.employeeId)
        );
    }, [allEmployees, currentPointEmployees]);

    const addEmployee = (emp) => {
        setCurrentPointEmployees([...currentPointEmployees, emp]);
    };

    const removeEmployee = (id) => {
        setCurrentPointEmployees(currentPointEmployees.filter(e => e.employeeId !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Обновляем саму точку (адрес, часы и manager_name)
            // Формируем managerName из имен текущего списка для колонки в БД PickupPoint
            const updatedNames = currentPointEmployees.map(e => e.fullName).join(', ');
            const pointData = { ...formData, managerName: updatedNames };

            let savedPoint = point;
            if (point) {
                await api.put(`/pickuppoints/${point.pointId}`, pointData);
            } else {
                const res = await api.post('/pickuppoints', pointData);
                savedPoint = res.data;
            }

            // 2. СИНХРОНИЗАЦИЯ point_id у сотрудников
            const pointId = savedPoint.pointId;

            // Кто был удален: были в initial, но нет в current -> ставим pointId = null (или 0)
            const removed = initialPointEmployees.filter(init => 
                !currentPointEmployees.find(curr => curr.employeeId === init.employeeId)
            );
            
            // Кто добавлен: есть в current, но не было в initial -> ставим текущий pointId
            const added = currentPointEmployees.filter(curr => 
                !initialPointEmployees.find(init => init.employeeId === curr.employeeId)
            );

            // Выполняем обновления (в идеале сделать один эндпоинт на бэке, но если нельзя менять бэк сильно:)
            for (const emp of removed) {
                await api.put(`/employees/${emp.employeeId}`, { ...emp, pointId: null });
            }
            for (const emp of added) {
                await api.put(`/employees/${emp.employeeId}`, { ...emp, pointId: pointId });
            }

            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении связей сотрудников");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-black text-gray-900">Редактирование точки</h3>
                    <button onClick={onClose} className="text-gray-400 text-3xl">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Адрес</label>
                            <input 
                                required
                                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-3"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Часы работы</label>
                            <input 
                                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-3"
                                value={formData.openingHours}
                                onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* СЕКЦИЯ ШТАТА (Синхронизация с Employee.point_id) */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Сотрудники на этой точке</label>
                        
                        <div className="flex flex-wrap gap-2 p-4 bg-blue-50/30 rounded-2xl border border-blue-100 min-h-[60px]">
                            {currentPointEmployees.map(emp => (
                                <div key={emp.employeeId} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                                    <span>👤 {emp.fullName}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => removeEmployee(emp.employeeId)}
                                        className="hover:text-red-200 ml-1 text-lg"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            {currentPointEmployees.length === 0 && <span className="text-gray-400 text-xs italic">Никто не назначен</span>}
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Доступные сотрудники</span>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                                {availableEmployees.map(emp => (
                                    <button
                                        key={emp.employeeId}
                                        type="button"
                                        onClick={() => addEmployee(emp)}
                                        className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1"
                                    >
                                        <span className="text-blue-500 font-bold">+</span> {emp.fullName}
                                        {emp.pointId && <span className="text-[9px] text-gray-400 ml-1">(с точки #{emp.pointId})</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-gray-400 font-bold">Отмена</button>
                        <button type="submit" className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-600 transition-all">
                            Сохранить всё
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};