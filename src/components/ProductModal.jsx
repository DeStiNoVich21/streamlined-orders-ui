import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
// --- ИМПОРТ ДЛЯ ЛОГИРОВАНИЯ ---
import { logActivity } from '../utils/logger';

export const ProductModal = ({ isOpen, onClose, onSave, product = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        price: 0,
        stockQuantity: 0,
        description: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || '',
                price: product.price || 0,
                stockQuantity: product.stockQuantity || 0,
                description: product.description || ''
            });
        } else {
            setFormData({ title: '', price: 0, stockQuantity: 0, description: '' });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (product) {
                await api.put(`/products/${product.productId}`, formData);
                // ЛОГИРОВАНИЕ ИЗМЕНЕНИЯ
                logActivity('Склад', `Обновлен товар: ${formData.title} (ID: ${product.productId})`);
            } else {
                await api.post('/products', formData);
                // ЛОГИРОВАНИЕ СОЗДАНИЯ
                logActivity('Склад', `Создан новый товар: ${formData.title}`);
            }
            onSave();
            onClose();
        } catch (err) {
            alert("Ошибка при сохранении продукта");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-black text-gray-900">
                        {product ? 'Изменить товар' : 'Новый товар'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Название</label>
                        <input required type="text" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Цена ($)</label>
                            <input required type="number" step="0.01" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Склад (шт)</label>
                            <input required type="number" className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                                value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Описание</label>
                        <textarea className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" 
                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50 transition-colors">Отмена</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                            {product ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};