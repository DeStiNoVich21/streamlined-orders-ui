import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const EmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
    // Добавляем список всех доступных точек для выпадающего списка
    const [pickupPoints, setPickupPoints] = useState([]);
    
    const [formData, setFormData] = useState({
        fullName: '',
        jobTitle: '',
        phone: '',
        pointId: '' // Новое поле для связи
    });

    useEffect(() => {
        // Загружаем список точек выдачи, чтобы назначить сотрудника
        const fetchPoints = async () => {
            try {
                const res = await api.get('/pickuppoints');
                // Обработка возможного формата $values от JSON-сериализатора ASP.NET
                setPickupPoints(res.data.$values || res.data || []);
            } catch (err) {
                console.error("Ошибка загрузки точек выдачи:", err);
            }
        };

        if (isOpen) {
            fetchPoints();
            if (employee) {
                setFormData({
                    fullName: employee.fullName || '',
                    jobTitle: employee.jobTitle || '',
                    phone: employee.phone || '',
                    pointId: employee.pointId || '' // Предзаполняем ID точки
                });
            } else {
                setFormData({ fullName: '', jobTitle: '', phone: '', pointId: '' });
            }
        }
    }, [employee, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Подготавливаем данные для отправки (превращаем pointId в число или null)
        const payload = {
            ...formData,
            pointId: formData.pointId ? parseInt(formData.pointId) : null
        };

        try {
            if (employee) {
                await api.put(`/employees/${employee.employeeId}`, payload);
            } else {
                await api.post('/employees', payload);
            }
            onSave();
            onClose();
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            alert("Ошибка. Возможно, вы не заполнили обязательные поля.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-950">
                        {employee ? `Профиль сотрудника #${employee.employeeId}` : 'Регистрация сотрудника'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">ФИО сотрудника</label>
                        <input 
                            required
                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50/50"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Должность</label>
                            <input 
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50/50"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Телефон</label>
                            <input 
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50/50"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* НОВОЕ ПОЛЕ: Привязка к точке выдачи */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Пункт выдачи (место работы)</label>
                        <select 
                            required
                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50/50 appearance-none cursor-pointer"
                            value={formData.pointId}
                            onChange={(e) => setFormData({...formData, pointId: e.target.value})}
                        >
                            <option value="">Выберите локацию...</option>
                            {pickupPoints.map(point => (
                                <option key={point.pointId} value={point.pointId}>
                                    {point.address} (ID: {point.pointId})
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-2 italic">
                            * Сотрудник должен быть закреплен за конкретной точкой для управления заказами.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="px-8 py-3 font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            Отмена
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            {employee ? 'Обновить данные' : 'Зарегистрировать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};