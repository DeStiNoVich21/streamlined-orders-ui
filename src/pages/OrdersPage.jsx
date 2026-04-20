import React, { useEffect, useState } from 'react'; // Добавили React сюда
import api from '../api/axiosInstance';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { EditOrderModal } from '../components/EditOrderModal';

export const OrdersPage = () => {
    // ... остальной код без изменений
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Храним товары для каждого заказа отдельно: { [orderId]: [items] }
    const [orderItemsData, setOrderItemsData] = useState({});
    const [loadingItems, setLoadingItems] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedRows, setExpandedRows] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, customersRes, employeesRes] = await Promise.all([
                api.get('/orders'),
                api.get('/customers'),
                api.get('/employees')
            ]);
            setOrders(ordersRes.data.$values || ordersRes.data || []);
            setCustomers(customersRes.data.$values || customersRes.data || []);
            setEmployees(employeesRes.data.$values || employeesRes.data || []);
        } catch (err) {
            console.error("Ошибка загрузки:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const fetchOrderItems = async (orderId) => {
    if (orderItemsData[orderId]) return;

    setLoadingItems(prev => ({ ...prev, [orderId]: true }));
    try {
        const res = await api.get(`/orders/${orderId}/items`);
        console.log("Данные от API для заказа " + orderId, res.data); // Посмотри в консоль браузера

        let items = [];
        
        // 1. Проверяем, не пришел ли массив напрямую
        if (Array.isArray(res.data)) {
            items = res.data;
        } 
        // 2. Проверяем формат EF Core с $values (самый вероятный случай)
        else if (res.data && res.data.$values) {
            items = res.data.$values;
        }
        // 3. Если пришел одиночный объект (одна позиция)
        else if (res.data && typeof res.data === 'object') {
            items = [res.data];
        }

        setOrderItemsData(prev => ({ ...prev, [orderId]: items }));
    } catch (err) {
        console.error("Ошибка загрузки состава заказа:", err);
    } finally {
        setLoadingItems(prev => ({ ...prev, [orderId]: false }));
    }
};

    const toggleRow = (id) => {
        const isExpanding = !expandedRows.includes(id);
        setExpandedRows(prev => 
            isExpanding ? [...prev, id] : prev.filter(rowId => rowId !== id)
        );
        
        if (isExpanding) {
            fetchOrderItems(id);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Вы уверены, что хотите удалить заказ #${id}?`)) {
            try {
                await api.delete(`/orders/${id}`);
                setOrders(orders.filter(o => o.orderId !== id));
            } catch (err) {
                alert("Ошибка при удалении.");
            }
        }
    };

    const getCustomerName = (id) => customers.find(c => c.customerId === id)?.fullName || `Клиент #${id}`;
    const getEmployeeName = (id) => employees.find(e => e.employeeId === id)?.fullName || `Сотрудник #${id}`;

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.orderId.toString().includes(searchTerm) || 
            getCustomerName(order.customerId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading && orders.length === 0) return <div className="p-8 text-center italic">Загрузка данных...</div>;

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-900">Управление заказами</h2>
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="p-2.5 border rounded-xl hover:bg-gray-50">🔄</button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">+ Создать заказ</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Поиск по ID или имени..." 
                            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">Все статусы</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-xs font-bold text-gray-400 uppercase">
                            <th className="p-5 w-10"></th>
                            <th className="p-5">ID</th>
                            <th className="p-5">Данные заказа</th>
                            <th className="p-5 text-center">Статус</th>
                            <th className="p-5 text-right">Сумма</th>
                            <th className="p-5 text-center">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map(order => (
                            <React.Fragment key={order.orderId}>
                                <tr className="hover:bg-blue-50/10 transition-colors group">
                                    <td className="p-5">
                                        <button 
                                            onClick={() => toggleRow(order.orderId)}
                                            className={`transition-transform duration-200 ${expandedRows.includes(order.orderId) ? 'rotate-90' : ''}`}
                                        >
                                            ▶
                                        </button>
                                    </td>
                                    <td className="p-5 font-mono font-bold text-blue-600">#{order.orderId}</td>
                                    <td className="p-5">
                                        <div className="font-bold text-gray-800">{getCustomerName(order.customerId)}</div>
                                        <div className="text-[11px] text-gray-400">👔 {getEmployeeName(order.employeeId)}</div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {order.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-5 font-black text-gray-900 text-right">{order.totalAmount?.toLocaleString()} ₽</td>
                                    <td className="p-5 text-center space-x-2">
                                        <button onClick={() => setEditingOrderId(order.orderId)} className="text-blue-500 hover:text-blue-700 text-xs font-bold p-2">ИЗМЕНИТЬ</button>
                                        <button onClick={() => handleDelete(order.orderId)} className="text-red-400 hover:text-red-600 text-xs font-bold p-2">УДАЛИТЬ</button>
                                    </td>
                                </tr>
                                
                                {expandedRows.includes(order.orderId) && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan="6" className="p-6">
                                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-inner">
                                                <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">📦 Состав заказа:</h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {loadingItems[order.orderId] ? (
    <div className="text-sm text-gray-500 animate-pulse">Загрузка товаров...</div>
) : orderItemsData[order.orderId]?.length > 0 ? (
    orderItemsData[order.orderId].map((item, idx) => {
        // Проверяем наличие данных, так как в JSON может быть null
        if (!item) return null; 
        
        return (
            <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                <span className="text-gray-700">
                    <span className="font-bold">
                        {/* Обращаемся к вложенному объекту product */}
                        {item.product?.title || `Товар #${item.productId}`}
                    </span> 
                    {item.quantity && ` x ${item.quantity} шт.`}
                </span>
                <span className="font-bold text-gray-900">
                    {item.priceAtPurchase?.toLocaleString()} ₽
                </span>
            </div>
        );
    })
) : (
    <div className="text-gray-400 italic text-sm">В этом заказе нет товаров</div>
)}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onOrderCreated={fetchData} />
            <EditOrderModal isOpen={!!editingOrderId} orderId={editingOrderId} onClose={() => setEditingOrderId(null)} onOrderUpdated={fetchData} />
        </div>
    );
};