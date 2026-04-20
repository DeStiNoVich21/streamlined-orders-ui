import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const EditOrderModal = ({ isOpen, onClose, orderId, onOrderUpdated }) => {
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [orderItems, setOrderItems] = useState([]); // Состояние для товаров
    const [formData, setFormData] = useState({
        customerId: '',
        employeeId: '',
        status: ''
    });

    useEffect(() => {
        if (isOpen && orderId) {
            const loadData = async () => {
                try {
                    const [cRes, eRes, oRes, itemsRes] = await Promise.all([
                        api.get('/customers'),
                        api.get('/employees'),
                        api.get(`/orders/${orderId}`),
                        api.get(`/orders/${orderId}/items`) // Загружаем товары отдельно
                    ]);

                    const customersData = cRes.data.$values || cRes.data;
                    const employeesData = eRes.data.$values || eRes.data;
                    const itemsData = itemsRes.data.$values || itemsRes.data;

                    setCustomers(Array.isArray(customersData) ? customersData : []);
                    setEmployees(Array.isArray(employeesData) ? employeesData : []);
                    setOrderItems(Array.isArray(itemsData) ? itemsData : []);

                    const order = oRes.data;
                    setFormData({
                        customerId: order.customerId || '',
                        employeeId: order.employeeId || '',
                        status: order.status || 'Processing'
                    });
                } catch (err) {
                    console.error("Ошибка загрузки:", err);
                }
            };
            loadData();
        }
    }, [isOpen, orderId]);

    // Функция удаления товара из списка (локально до сохранения)
    const handleRemoveItem = (productId) => {
        setOrderItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Формируем объект для отправки. 
            // ВАЖНО: Бэкенд должен ожидать список Items внутри Put запроса
            const updatePayload = {
                ...formData,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            await api.put(`/orders/${orderId}`, updatePayload);
            onOrderUpdated(); 
            onClose();
        } catch (err) {
            alert("Ошибка при сохранении: " + (err.response?.data || err.message));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Редактирование заказа #{orderId}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Клиент</label>
                            <select 
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.customerId}
                                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                            >
                                {customers.map(c => (
                                    <option key={c.customerId} value={c.customerId}>{c.fullName || "Без имени"}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Сотрудник</label>
                            <select 
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                            >
                                {employees.map(e => (
                                    <option key={e.employeeId} value={e.employeeId}>{e.fullName || "Сотрудник"}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Статус заказа</label>
                        <select 
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* СЕКЦИЯ РЕДАКТИРОВАНИЯ ТОВАРОВ */}
                    <div className="border-t pt-4">
                        <h3 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
                            📦 Товары в заказе
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {orderItems.length > 0 ? orderItems.map((item) => (
                                <div key={item.productId} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-gray-800">
                                            {item.product?.title || `Товар #${item.productId}`}
                                        </span>
                                        <span className="text-xs text-gray-500">{item.priceAtPurchase} ₽ / шт.</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-600">{item.quantity} шт.</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveItem(item.productId)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                            title="Удалить из заказа"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-400 italic text-center py-4">В заказе нет товаров</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-500 font-medium">Отмена</button>
                        <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all">
                            Сохранить изменения
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};