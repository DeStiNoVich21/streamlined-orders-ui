import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const EmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
    // Внутреннее состояние для полей формы
    const [formData, setFormData] = useState({
        fullName: '',
        jobTitle: '',
        phone: ''
    });

    // Эффект для заполнения формы данными при редактировании или очистки при создании
    useEffect(() => {
        if (employee) {
            // Режим редактирования
            setFormData({
                fullName: employee.fullName || '',
                jobTitle: employee.jobTitle || '',
                phone: employee.phone || ''
            });
        } else {
            // Режим создания нового сотрудника
            setFormData({ fullName: '', jobTitle: '', phone: '' });
        }
    }, [employee, isOpen]);

    if (!isOpen) return null;

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (employee) {
                // PUT запрос для обновления существующего сотрудника
                await api.put(`/employees/${employee.employeeId}`, formData);
            } else {
                // POST запрос для создания нового сотрудника
                await api.post('/employees', formData);
            }
            onSave(); // Вызываем колбэк для обновления списка на главной странице
            onClose(); // Закрываем модальное окно
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            alert("Не удалось сохранить данные сотрудника. Проверьте консоль.");
        }
    };

    return (
        // Оверлей модального окна (затемнение фона)
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Само модальное окно */}
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                
                {/* ХЕДЕР: Светлый фон, серый разделитель снизу */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-950">
                        {employee ? `Редактирование сотрудника #${employee.employeeId}` : 'Новый сотрудник'}
                    </h3>
                    {/* Кнопка закрытия (крестик) */}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl group">
                        <span className="group-hover:rotate-90 block transition-transform">&times;</span>
                    </button>
                </div>
                
                {/* ТЕЛО ФОРМЫ */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    {/* Поле: ФИО */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1.5">ФИО сотрудника</label>
                        <input 
                            required
                            type="text"
                            placeholder="Например: Иванов Иван Иванович"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                    
                    {/* Поле: Должность */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1.5">Должность</label>
                        <input 
                            type="text"
                            placeholder="Например: Менеджер по продажам"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                        />
                    </div>

                    {/* Поле: Телефон */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1.5">Телефон</label>
                        <input 
                            type="tel"
                            placeholder="+7 (___) ___ __ __"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    {/* ФУТЕР С КНОПКАМИ: Выровнены по правому краю */}
                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-50">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition-colors active:scale-95 shadow-sm"
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            {employee ? 'Сохранить изменения' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};