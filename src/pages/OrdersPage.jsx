import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { EditOrderModal } from '../components/EditOrderModal';

export const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]); // Справочник клиентов
    const [employees, setEmployees] = useState([]); // Справочник сотрудников
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState(null);

    // Функция для получения читаемого имени
    const getCustomerName = (id) => {
        const customer = customers.find(c => c.customerId === id);
        return customer ? customer.fullName : `Клиент #${id}`;
    };

    const getEmployeeName = (id) => {
        const employee = employees.find(e => e.employeeId === id);
        return employee ? employee.fullName : `Сотрудник #${id}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Загружаем всё параллельно, как в модалке
            const [ordersRes, customersRes, employeesRes] = await Promise.all([
                api.get('/orders'),
                api.get('/customers'),
                api.get('/employees')
            ]);

            // Обработка возможного $values от бэкенда
            setOrders(ordersRes.data.$values || ordersRes.data || []);
            setCustomers(customersRes.data.$values || customersRes.data || []);
            setEmployees(employeesRes.data.$values || employeesRes.data || []);
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Processing' ? 'Delivered' : 'Processing';
        try {
            await api.patch(`/orders/${id}/status`, nextStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            setOrders(orders.map(o => o.orderId === id ? { ...o, status: nextStatus } : o));
        } catch (err) {
            alert("Не удалось обновить статус");
        }
    };

    if (loading && orders.length === 0) return <div className="p-8 text-center italic">Загрузка данных...</div>;

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Заказы</h2>
                    <p className="text-gray-500 text-sm">Управление продажами и статусами</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        type="button"
                        onClick={fetchData}
                        className="flex-1 md:flex-none border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <span>🔄</span> Обновить всё
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 transition-transform active:scale-95"
                    >
                        + Создать
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-200">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">ID</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase">Данные заказа</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase text-center">Статус и Оплата</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase text-right">Сумма</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase text-center">Действие</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr key={order.orderId} className="hover:bg-blue-50/20 transition-colors group">
                                <td className="p-5 font-mono font-bold text-blue-600">#{order.orderId}</td>
                                <td className="p-5">
                                    <div className="font-bold text-gray-800">
                                        {/* Используем хелпер для вывода имени клиента по ID */}
                                        👤 {getCustomerName(order.customerId)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 flex flex-col gap-1">
                                        <span className="flex items-center gap-1">
                                            {/* Используем хелпер для вывода имени сотрудника по ID */}
                                            👔 Продавец: <span className="text-gray-600 font-medium">{getEmployeeName(order.employeeId)}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📅 {new Date(order.orderDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => toggleStatus(order.orderId, order.status)}
                                            className={`w-32 py-1 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                                                order.status === 'Delivered' 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                            }`}
                                        >
                                            {order.status?.toUpperCase()}
                                        </button>
                                        
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                                            order.paymentStatus === 'Paid' 
                                            ? 'border-green-200 text-green-600 bg-green-50' 
                                            : 'border-red-200 text-red-600 bg-red-50'
                                        }`}>
                                            {order.paymentStatus || 'Pending'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-5 font-black text-gray-900 text-right">
                                    {order.totalAmount?.toLocaleString()} ₽
                                </td>
                                <td className="p-5 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => setEditingOrderId(order.orderId)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                        ИЗМЕНИТЬ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateOrderModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onOrderCreated={fetchData} 
            />
            
            <EditOrderModal 
                isOpen={!!editingOrderId} 
                orderId={editingOrderId}
                onClose={() => setEditingOrderId(null)} 
                onOrderUpdated={fetchData} 
            />
        </div>
    );
};