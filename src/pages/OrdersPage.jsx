import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
        api.get('/orders')
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Функция обновления статуса через HttpPatch
    const handleStatusUpdate = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Processing' ? 'Delivered' : 'Processing';
        try {
            // В твоем контроллере [FromBody] string status, поэтому передаем строку напрямую
            await api.patch(`/orders/${id}/status`, nextStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchOrders(); // Обновляем список
        } catch (err) {
            alert("Ошибка при обновлении статуса");
        }
    };

    if (loading) return <div className="p-8">Загрузка заказов...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-gray-800">
                <h2 className="text-2xl font-bold">Управление заказами</h2>
                <button 
                    onClick={() => alert('Форма создания заказа должна соответствовать CreateOrderDto')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                >
                    + Новый заказ
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-gray-600">Заказ</th>
                            <th className="p-4 text-gray-600">Клиент</th>
                            <th className="p-4 text-gray-600">Статус</th>
                            <th className="p-4 text-gray-600">Сумма</th>
                            <th className="p-4 text-gray-600 text-center">Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.orderId} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 font-semibold text-blue-600">#{order.orderId}</td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-800">{order.customer?.fullName || 'Загрузка...'}</div>
                                    <div className="text-xs text-gray-400">ID клиента: {order.customerId}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 font-bold text-gray-900">{order.totalAmount} ₽</td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleStatusUpdate(order.orderId, order.status)}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded border transition"
                                    >
                                        Сменить статус
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};