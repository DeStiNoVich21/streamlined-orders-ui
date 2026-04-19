import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const EditOrderModal = ({ isOpen, onClose, orderId, onOrderUpdated }) => {
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        customerId: '',
        employeeId: '',
        status: '',
        paymentStatus: ''
    });

    useEffect(() => {
    if (isOpen && orderId) {
        const loadData = async () => {
            try {
                const [cRes, eRes, oRes] = await Promise.all([
            api.get('/customers'),
            api.get('/employees'),
            api.get(`/orders/${orderId}`)
        ]);

        // Если в консоли видишь что данные лежат в .$values, используй их
        const customersData = cRes.data.$values || cRes.data;
        const employeesData = eRes.data.$values || eRes.data;

        setCustomers(Array.isArray(customersData) ? customersData : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);

                const order = oRes.data;
                setFormData({
                    // Пробуем разные варианты написания ключей, если один не сработает
                    customerId: order.customerId || order.customer_id || '',
                    employeeId: order.employeeId || order.employee_id || '',
                    status: order.status || 'Processing',
                    paymentStatus: order.paymentStatus || 'Pending'
                });
            } catch (err) {
                console.error("Ошибка при загрузке данных в модалку:", err);
                if (err.response?.status === 403) {
                    alert("У вас нет прав на просмотр списка сотрудников или клиентов");
                }
            }
        };
        loadData();
    }
}, [isOpen, orderId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Отправляем изменения на бэкенд (HttpPut)
            await api.put(`/orders/${orderId}`, formData);
            onOrderUpdated(); // Обновляем список в родителе
            onClose();
        } catch (err) {
            alert("Ошибка при сохранении: " + (err.response?.data || err.message));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Редактирование заказа #{orderId}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Изменить клиента</label>
                        <select 
    className="w-full border rounded-lg p-2.5"
    value={formData.customerId}
    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
>
    <option value="">Выберите клиента</option>
    {customers.map(c => (
        <option key={c.customerId} value={c.customerId}>
            {/* Если fullName пусто, попробуй full_name */}
            {c.fullName || c.full_name || "Без имени"} 
        </option>
    ))}
</select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Назначить сотрудника</label>
                        <select 
    className="w-full border rounded-lg p-2.5"
    value={formData.employeeId}
    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
>
    <option value="">Выберите сотрудника</option>
    {employees.map(e => (
        <option key={e.employeeId || e.employee_id} value={e.employeeId || e.employee_id}>
            {e.fullName || e.full_name || "Неизвестный сотрудник"}
        </option>
    ))}
</select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Статус</label>
                            <select 
                                className="w-full border rounded-lg p-2.5"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Оплата</label>
                            <select 
                                className="w-full border rounded-lg p-2.5"
                                value={formData.paymentStatus}
                                onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-500 font-medium">Отмена</button>
                        <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors">
                            Сохранить изменения
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};