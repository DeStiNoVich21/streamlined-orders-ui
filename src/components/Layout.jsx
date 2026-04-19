import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Боковое меню (Sidebar) */}
            <div className="w-64 bg-slate-900 text-white p-6 shadow-xl flex flex-col">
                <h1 className="text-2xl font-bold mb-10 text-blue-400">ERP System</h1>
                <nav className="space-y-4 flex-1">
                    <Link to="/orders" className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded transition">
                        <span>📦</span> <span>Заказы</span>
                    </Link>
                    <Link to="/customers" className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded transition">
                        <span>👥</span> <span>Клиенты</span>
                    </Link>
                    {user?.role === 'Admin' && (
                        <div className="pt-4 border-t border-slate-700 mt-4">
                            <p className="text-xs text-slate-500 uppercase mb-2">Администрирование</p>
                            <Link to="/admin" className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded text-orange-300">
                                <span>⚙️</span> <span>Пользователи</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
            
{/* Основная область */}
<div className="flex-1 flex flex-col min-w-0"> {/* Добавили min-w-0 */}
    <header className="bg-white shadow-md p-4 flex justify-between items-center px-8 flex-shrink-0">
        <div className="text-gray-500">
            Панель управления / <span className="text-gray-900 font-semibold uppercase">{user?.role}</span>
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button 
                onClick={handleLogout}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
                Выйти
            </button>
        </div>
    </header>

    <main className="p-8 flex-1 overflow-y-auto"> {/* Убрали лишние ограничения, добавили flex-1 */}
        <div className="max-w-[1600px] mx-auto w-full"> {/* Контейнер для центровки на ОЧЕНЬ широких экранах */}
            {children}
        </div>
    </main>
</div>
        </div>
    );
};