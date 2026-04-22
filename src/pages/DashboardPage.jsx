import { useEffect, useState, useMemo } from 'react';
import api from '../api/axiosInstance';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';

export const DashboardPage = () => {
    const [orderItems, setOrderItems] = useState([]);
    const [pickupPoints, setPickupPoints] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Состояния фильтрации (Поиск, Лимит, Сортировка)
    const [prodS, setProdS] = useState({ q: '', lim: 5, sort: 'desc' });
    const [pointS, setPointS] = useState({ q: '', lim: 5, sort: 'desc' });
    const [custS, setCustS] = useState({ q: '', lim: 5, sort: 'desc' });

    // Цветовые палитры
    const COLORS_PROD = ['#3B82F6', '#60A5FA', '#93C5FD', '#A5B4FC', '#C7D2FE'];
    const COLORS_POINT = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];
    const COLORS_CUST = ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'];

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Параллельная загрузка всех данных для сопоставления
                const [itemsRes, pointsRes, custRes] = await Promise.all([
                    api.get('/orders/items/all-detailed'),
                    api.get('/PickupPoints'),
                    api.get('/customers')
                ]);

                setOrderItems(itemsRes.data?.$values || itemsRes.data || []);
                setPickupPoints(pointsRes.data?.$values || pointsRes.data || []);
                setCustomers(custRes.data?.$values || custRes.data || []);
            } catch (err) {
                console.error("Ошибка аналитики:", err);
            } finally {
                setLoading(false);
                setTimeout(() => setIsMounted(true), 150);
            }
        };
        fetchAllData();
    }, []);

    // --- МАППИНГИ ДЛЯ ТРАНСЛЯЦИИ ID -> ИМЯ ---
    const pointsMap = useMemo(() => 
        Object.fromEntries(pickupPoints.map(p => [p.pointId, p.address])), [pickupPoints]);
    
    const custMap = useMemo(() => 
        Object.fromEntries(customers.map(c => [c.customerId, c.name])), [customers]);

    // 1. АНАЛИТИКА ТОВАРОВ (по количеству проданных штук)
    const productData = useMemo(() => {
        const stats = {};
        orderItems.forEach(item => {
            const name = item.product?.title || `Товар #${item.productId}`;
            if (name.toLowerCase().includes(prodS.q.toLowerCase())) {
                stats[name] = (stats[name] || 0) + (item.quantity || 1);
            }
        });
        return Object.entries(stats).map(([name, count]) => ({ name, count }))
            .sort((a, b) => prodS.sort === 'desc' ? b.count - a.count : a.count - b.count)
            .slice(0, prodS.lim);
    }, [orderItems, prodS]);

    // 2. АНАЛИТИКА ТОЧЕК (по количеству уникальных заказов)
    const pointData = useMemo(() => {
        const stats = {};
        orderItems.forEach(item => {
            const pointId = item.order?.pickupPointId;
            const name = item.order?.pickupPoint?.address || pointsMap[pointId] || `Точка #${pointId}`;
            if (name.toLowerCase().includes(pointS.q.toLowerCase())) {
                if (!stats[name]) stats[name] = new Set();
                stats[name].add(item.orderId);
            }
        });
        return Object.entries(stats).map(([name, set]) => ({ name, count: set.size }))
            .sort((a, b) => pointS.sort === 'desc' ? b.count - a.count : a.count - b.count)
            .slice(0, pointS.lim);
    }, [orderItems, pointsMap, pointS]);

    // 3. АНАЛИТИКА КЛИЕНТОВ (по количеству уникальных заказов)
    const customerData = useMemo(() => {
        const stats = {};
        orderItems.forEach(item => {
            const custId = item.order?.customerId;
            // Сопоставляем имя из справочника, если объект customer пуст
            const name = item.order?.customer?.name || custMap[custId] || `Клиент #${custId}`;
            
            if (name.toLowerCase().includes(custS.q.toLowerCase())) {
                if (!stats[name]) stats[name] = new Set();
                stats[name].add(item.orderId);
            }
        });
        return Object.entries(stats).map(([name, set]) => ({ name, count: set.size }))
            .sort((a, b) => custS.sort === 'desc' ? b.count - a.count : a.count - b.count)
            .slice(0, custS.lim);
    }, [orderItems, custMap, custS]);

    if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse text-2xl uppercase tracking-tighter">Синхронизация данных...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen space-y-16">
            
            {/* СЕКЦИЯ: ТОП ТОВАРОВ */}
            <ChartSection 
                title="Лидеры продаж (товары)" 
                color="#2563eb" 
                data={productData} 
                isMounted={isMounted}
                colors={COLORS_PROD}
                filters={prodS}
                setFilters={setProdS}
                unit="шт."
            />

            {/* СЕКЦИЯ: ТОП ТОЧЕК (ТЕМНЫЙ СТИЛЬ) */}
            <ChartSection 
                title="Загруженность точек выдачи" 
                color="#10b981" 
                data={pointData} 
                isMounted={isMounted}
                colors={COLORS_POINT}
                filters={pointS}
                setFilters={setPointS}
                dark
                unit="зак."
            />

            {/* СЕКЦИЯ: ТОП КЛИЕНТОВ */}
            <ChartSection 
                title="Самые активные клиенты" 
                color="#f59e0b" 
                data={customerData} 
                isMounted={isMounted}
                colors={COLORS_CUST}
                filters={custS}
                setFilters={setCustS}
                unit="зак."
            />
        </div>
    );
};

// Универсальный компонент для вывода графика с фильтрами
const ChartSection = ({ title, color, data, isMounted, colors, filters, setFilters, dark, unit }) => (
    <section className="max-w-6xl mx-auto space-y-4">
        {/* Панель управления */}
        <div className={`${dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} p-6 rounded-[2rem] shadow-sm flex flex-wrap items-center gap-4 border border-slate-100`}>
            <div className="flex-1 min-w-[200px]">
                <label className="text-[9px] uppercase font-black opacity-40 ml-1">Живой поиск</label>
                <input 
                    type="text" 
                    value={filters.q} 
                    onChange={e => setFilters({...filters, q: e.target.value})}
                    className={`w-full ${dark ? 'bg-white/10' : 'bg-slate-50'} rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-offset-2 mt-1`}
                    placeholder="Введите название или имя..."
                />
            </div>
            <div className="w-32">
                <label className="text-[9px] uppercase font-black opacity-40 ml-1">Лимит</label>
                <select value={filters.lim} onChange={e => setFilters({...filters, lim: Number(e.target.value)})} className={`w-full ${dark ? 'bg-white/10' : 'bg-slate-50'} rounded-xl px-4 py-2 text-sm font-bold outline-none mt-1`}>
                    <option value={5} className="text-black">Топ-5</option>
                    <option value={10} className="text-black">Топ-10</option>
                    <option value={20} className="text-black">Топ-20</option>
                </select>
            </div>
            <div className="w-44">
                <label className="text-[9px] uppercase font-black opacity-40 ml-1">Порядок</label>
                <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} className={`w-full ${dark ? 'bg-white/10' : 'bg-slate-50'} rounded-xl px-4 py-2 text-sm font-bold outline-none mt-1`}>
                    <option value="desc" className="text-black">По убыванию</option>
                    <option value="asc" className="text-black">По возрастанию</option>
                </select>
            </div>
        </div>

        {/* Тело графика */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase mb-8 flex items-center gap-2 tracking-tight">
                <span className="w-2 h-6 rounded-full" style={{ backgroundColor: color }}></span> {title}
            </h3>
            <div className="h-[400px] w-full">
                {isMounted && data.length > 0 ? (
                    <ResponsiveContainer>
                        <BarChart data={data} layout="vertical" margin={{ left: 30, right: 70 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                                width={160} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={filters.lim > 10 ? 15 : 30}>
                                {data.map((e, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                                <LabelList 
                                    dataKey="count" 
                                    position="right" 
                                    offset={12} 
                                    style={{ fontWeight: 900, fill: '#1e293b', fontSize: 12 }} 
                                    formatter={(v) => `${v} ${unit}`} 
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-50 rounded-[2rem]">
                        <span className="text-4xl mb-2">🔎</span>
                        <p className="italic">Совпадений не найдено</p>
                    </div>
                )}
            </div>
        </div>
    </section>
);