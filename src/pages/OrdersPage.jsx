import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders')
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Ошибка загрузки заказов:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center py-10">Загрузка данных из БД...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Список заказов</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    + Создать заказ
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Клиент</th>
                            <th className="p-4 font-semibold text-gray-600">Дата</th>
                            <th className="p-4 font-semibold text-gray-600">Статус</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? orders.map(order => (
                            <tr key={order.orderId} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition">
                                <td className="p-4 font-medium">#{order.orderId}</td>
                                <td className="p-4 text-gray-700">{order.customer?.fullName || "Не указан"}</td>
                                <td className="p-4 text-gray-500 text-sm">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-semibold text-gray-900">
                                    {order.totalAmount?.toLocaleString()} ₽
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                                    Заказы пока не найдены в базе данных.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};