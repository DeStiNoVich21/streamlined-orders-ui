import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }) => {
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [products, setProducts] = useState([]);
    
    // 1. Обновляем начальное состояние
const [formData, setFormData] = useState({
    customerId: '',
    employeeId: '',
    pickupPointId: 1, 
    paymentStatus: 'Pending',
    paymentMethod: 'Cash', // Добавлено по умолчанию
    items: [] 
});

    const [currentItem, setCurrentItem] = useState({ productId: '', quantity: 1 });

    useEffect(() => {
        if (isOpen) {
            // Загружаем данные. Убедись, что эндпоинты совпадают с контроллерами
            Promise.all([
                api.get('/customers'),
                api.get('/employees'), // Твой новый EmployeesController
                api.get('/products')   // Твой ProductsController
            ]).then(([c, e, p]) => {
                setCustomers(c.data);
                setEmployees(e.data);
                setProducts(p.data);
            }).catch(err => console.error("Ошибка загрузки:", err));
        }
    }, [isOpen]);

    const addItem = (e) => {
        e.preventDefault(); // Важно! Чтобы не дергалась страница
        if (!currentItem.productId) return;
        
        const productInfo = products.find(p => p.productId === parseInt(currentItem.productId));
        
        setFormData({
            ...formData,
            items: [...formData.items, { 
                productId: parseInt(currentItem.productId), 
                quantity: currentItem.quantity,
                title: productInfo?.title // для отображения в списке
            }]
        });
        setCurrentItem({ productId: '', quantity: 1 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Остановка перезагрузки страницы
        try {
            await api.post('/orders', {
                customerId: parseInt(formData.customerId),
                employeeId: parseInt(formData.employeeId),
                pickupPointId: formData.pickupPointId,
                paymentStatus: formData.paymentStatus,
                paymentMethod: formData.paymentMethod,
                items: formData.items.map(({productId, quantity}) => ({productId, quantity}))
            });
            onOrderCreated(); 
            onClose(); 
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка при создании заказа");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Оформление нового заказа</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Клиент</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.customerId}
                                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                                required
                            >
                                <option value="">Выберите из базы...</option>
                                {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.fullName}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Сотрудник</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                required
                            >
                                <option value="">Кто продает?</option>
                                {employees.map(e => <option key={e.employeeId} value={e.employeeId}>{e.fullName} ({e.jobTitle})</option>)}
                            </select>
                        </div>
                    </div>
<div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">Способ оплаты</label>
    <select 
        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        value={formData.paymentMethod}
        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
    >
        <option value="Cash">Наличные</option>
        <option value="Card">Карта</option>
        <option value="Online">Онлайн</option>
    </select>
</div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                            <span>🛒</span> Состав заказа
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <select 
                                className="flex-1 border border-gray-300 rounded-lg p-2 bg-white"
                                value={currentItem.productId}
                                onChange={(e) => setCurrentItem({...currentItem, productId: e.target.value})}
                            >
                                <option value="">Выберите товар...</option>
                                {products.map(p => (
                                    <option key={p.productId} value={p.productId}>
                                        {p.title} — {p.price} ₽ (Остаток: {p.stockQuantity})
                                    </option>
                                ))}
                            </select>
                            <input 
                                type="number" 
                                min="1"
                                className="w-20 border border-gray-300 rounded-lg p-2 bg-white text-center"
                                value={currentItem.quantity}
                                onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})}
                            />
                            <button 
                                type="button" // Важно: не submit!
                                onClick={addItem}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition-colors"
                            > Добавить </button>
                        </div>

                        <div className="space-y-2">
                            {formData.items.length === 0 && <p className="text-gray-400 text-sm italic">Список пуст...</p>}
                            {formData.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                                    <span className="font-medium text-gray-700">{item.title}</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">x{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button 
                            type="button" // Обязательно button для отмены
                            onClick={onClose} 
                            className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium transition"
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95"
                        >
                            Оформить заказ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};