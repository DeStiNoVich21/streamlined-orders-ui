import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'bg-slate-800 text-blue-400' : '';

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white p-6 shadow-xl flex flex-col flex-shrink-0">
                <h1 className="text-2xl font-bold mb-10 text-blue-400 tracking-tighter">ERP System</h1>
                
                <nav className="space-y-2 flex-1">
                    <Link to="/orders" className={`flex items-center space-x-2 p-3 hover:bg-slate-800 rounded-xl transition ${isActive('/orders')}`}>
                        <span>📦</span> <span>Заказы</span>
                    </Link>

                    <Link to="/customers" className={`flex items-center space-x-2 p-3 hover:bg-slate-800 rounded-xl transition ${isActive('/customers')}`}>
                        <span>👥</span> <span>Клиенты</span>
                    </Link>

                    <Link to="/products" className={`flex items-center space-x-2 p-3 hover:bg-slate-800 rounded-xl transition ${isActive('/products')}`}>
                        <span>🏷️</span> <span>Товары</span>
                    </Link>

                    <Link to="/points" className={`flex items-center space-x-2 p-3 hover:bg-slate-800 rounded-xl transition ${isActive('/points')}`}>
                        <span>📍</span> <span>Пункты выдачи</span>
                    </Link>

                    {/* Секция Управления */}
                    {(user?.role === 'Admin' || user?.role === 'Manager') && (
                        <div className="pt-6 mt-6 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase mb-3 px-3 font-black tracking-widest">Администрирование</p>
                            
                            <Link to="/employees" className={`flex items-center space-x-2 p-3 hover:bg-slate-800 rounded-xl transition ${isActive('/employees')}`}>
                                <span>👨‍💼</span> <span>Сотрудники</span>
                            </Link>

                            {/* Ссылка видна только Админу */}
                            {user?.role === 'Admin' && (
                                <Link to="/users" className={`flex items-center space-x-2 p-3 hover:bg-slate-800 rounded-xl transition ${isActive('/users')}`}>
                                    <span className="text-orange-400">🛡️</span> <span>Пользователи</span>
                                </Link>
                            )}
                        </div>
                    )}
                </nav>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8 flex-shrink-0 border-b border-gray-100">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Система / <span className="text-gray-900">{location.pathname.replace('/', '') || 'Главная'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <div className="text-right border-r pr-6 border-gray-100">
                            <p className="text-sm font-black text-gray-900">{user?.username || 'User'}</p>
                            <p className="text-[10px] uppercase font-black text-blue-600">{user?.role}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-gray-50 hover:bg-red-50 text-red-500 p-2.5 rounded-xl transition-all active:scale-95 group"
                            title="Выйти из системы"
                        >
                            <span className="text-lg group-hover:rotate-12 transition-transform inline-block">🚪</span>
                        </button>
                    </div>
                </header>

                <main className="p-8 flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};