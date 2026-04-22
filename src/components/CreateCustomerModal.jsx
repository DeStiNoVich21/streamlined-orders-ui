import { useState } from 'react';
import api from '../api/axiosInstance';
// --- ИМПОРТ ДЛЯ ЛОГИРОВАНИЯ ---
import { logActivity } from '../utils/logger';

export const CreateCustomerModal = ({ isOpen, onClose, onCustomerCreated }) => {
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', address: '' });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers', formData);
            
            // --- ЛОГИРОВАНИЕ СОЗДАНИЯ КЛИЕНТА ---
            logActivity('Клиенты', `Создан новый клиент: ${formData.fullName}`);
            
            onCustomerCreated();
            onClose();
            setFormData({ fullName: '', email: '', phone: '', address: '' });
        } catch (err) {
            alert("Ошибка при создании клиента");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-black text-gray-900">Новый клиент</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ФИО</label>
                        <input required type="text" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                            value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                        <input type="email" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Телефон</label>
                        <input type="text" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                            value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Адрес</label>
                        <textarea className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 h-24" 
                            value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50">Отмена</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">Создать</button>
                    </div>
                </form>
            </div>
        </div>
    );
};