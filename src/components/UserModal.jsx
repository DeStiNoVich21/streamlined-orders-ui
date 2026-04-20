import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const UserModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '', // Добавляем для новых юзеров
        role: 'Employee',
        isActive: true
    });

    useEffect(() => {
        if (user && isOpen) {
            // Подтягиваем данные, учитывая оба варианта регистра (Backend/Frontend)
            setFormData({
                username: user.username || user.userName || user.Username || '',
                password: '', // Пароль не подтягиваем из соображений безопасности
                role: user.role || user.Role || 'Employee',
                isActive: user.isActive !== undefined ? user.isActive : (user.IsActive !== undefined ? user.IsActive : true)
            });
        } else if (isOpen) {
            // Сброс формы для нового пользователя
            setFormData({ username: '', password: '', role: 'Employee', isActive: true });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Маппим данные под структуру, которую ждет твой C# контроллер (UserRegisterDto / UserUpdateDto)
            const payload = {
                Username: formData.username,
                Role: formData.role,
                // Если редактируем — отправляем NewPassword, если создаем — Password
                ...(user ? { NewPassword: formData.password } : { Password: formData.password })
            };

            if (user) {
                const userId = user.userId || user.UserId;
                await api.put(`/admin/${userId}`, payload);
            } else {
                // Для создания нового пользователя у тебя маршрут api/admin/register
                await api.post('/admin/register', payload);
            }
            
            onSave(); // Обновить список на странице
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Ошибка при сохранении");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-black text-gray-900">
                        {user ? 'Управление аккаунтом' : 'Новый пользователь'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Логин системы</label>
                        <input 
                            required
                            className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            placeholder="ivan_admin"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">
                            {user ? 'Новый пароль (оставьте пустым, если не меняете)' : 'Пароль'}
                        </label>
                        <input 
                            required={!user}
                            type="password"
                            className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-3 focus:bg-white outline-none transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Роль</label>
                            <select 
                                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 outline-none font-bold text-gray-700 cursor-pointer"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="Admin">Админ</option>
                                <option value="Manager">Менеджер</option>
                                <option value="Employee">Сотрудник</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Доступ</label>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                                className={`w-full py-3 rounded-2xl font-black text-[11px] uppercase tracking-tighter transition-all shadow-sm ${
                                    formData.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}
                            >
                                {formData.isActive ? 'Разрешен' : 'Заблокирован'}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
                            Отмена
                        </button>
                        <button type="submit" className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-blue-600 active:scale-95 transition-all">
                            {user ? 'Сохранить изменения' : 'Зарегистрировать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};