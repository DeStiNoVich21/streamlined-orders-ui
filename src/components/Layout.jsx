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
            {/* Боковое меню (Sidebar) */}
            <div className="w-64 bg-slate-900 text-white p-6 shadow-xl flex flex-col flex-shrink-0">
                <h1 className="text-2xl font-bold mb-10 text-blue-400 tracking-tighter">ERP System</h1>
                
                <nav className="space-y-4 flex-1">
                    <Link to="/orders" className={`flex items-center space-x-2 p-2 hover:bg-slate-800 rounded transition ${isActive('/orders')}`}>
                        <span>📦</span> <span>Заказы</span>
                    </Link>

                    <Link to="/customers" className={`flex items-center space-x-2 p-2 hover:bg-slate-800 rounded transition ${isActive('/customers')}`}>
                        <span>👥</span> <span>Клиенты</span>
                    </Link>

                    <Link to="/products" className={`flex items-center space-x-2 p-2 hover:bg-slate-800 rounded transition ${isActive('/products')}`}>
                        <span>🏷️</span> <span>Товары</span>
                    </Link>
                    <Link to="/points" className={`flex items-center space-x-2 p-2 hover:bg-slate-800 rounded transition ${isActive('/points')}`}>
    <span>📍</span> <span>Пункты выдачи</span>
</Link>
                    {/* Секция для Админа и Менеджера */}
                    {(user?.role === 'Admin' || user?.role === 'Manager') && (
                        <div className="pt-4 border-t border-slate-700 mt-4">
                            <p className="text-[10px] text-slate-500 uppercase mb-2 font-black tracking-widest">Управление</p>
                            
                            {/* Ссылка на Сотрудников */}
                            <Link to="/employees" className={`flex items-center space-x-2 p-2 hover:bg-slate-800 rounded transition ${isActive('/employees')}`}>
                                <span>👨‍💼</span> <span>Сотрудники</span>
                            </Link>

                            {user?.role === 'Admin' && (
                                <Link to="/admin" className={`flex items-center space-x-2 p-2 hover:bg-slate-800 rounded text-orange-300 transition ${isActive('/admin')}`}>
                                    <span>⚙️</span> <span>Пользователи</span>
                                </Link>
                            )}
                        </div>
                    )}
                </nav>
            </div>
            
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-md p-4 flex justify-between items-center px-8 flex-shrink-0">
                    <div className="text-gray-500 text-sm">
                        Панель управления / <span className="text-gray-900 font-bold uppercase">{user?.role}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                            <p className="text-[10px] uppercase font-black text-blue-600">{user?.role}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm active:scale-95"
                        >
                            Выйти
                        </button>
                    </div>
                </header>

                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};