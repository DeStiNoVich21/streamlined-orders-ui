import { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosInstance';
import { UserModal } from '../components/UserModal';

export const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const getName = (u) => u?.username || u?.userName || u?.Username || "Без имени";
    const getRole = (u) => u?.role || u?.Role || "User";

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin');
            setUsers(res.data.$values || res.data || []);
        } catch (err) { 
            console.error("Ошибка:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const name = getName(u);
            const role = getRole(u);
            const email = u?.email || u?.Email || "";

            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'All' || role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentItems = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDelete = async (id) => {
        if (window.confirm("Удалить аккаунт безвозвратно?")) {
            try {
                await api.delete(`/admin/${id}`);
                setUsers(users.filter(u => (u.userId || u.UserId) !== id));
            } catch (err) { alert("Ошибка при удалении"); }
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Пользователи</h2>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Всего в базе: {filteredUsers.length}</p>
                    </div>
                    {/* Кнопка Обновить */}
                    <button 
                        onClick={fetchUsers}
                        className={`p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all active:rotate-180 duration-500 ${loading ? 'animate-spin' : ''}`}
                        title="Обновить данные"
                    >
                        🔄
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Поиск..."
                        className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-2.5 outline-none w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                    <select 
                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 outline-none font-bold text-gray-600"
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">Все роли</option>
                        <option value="Admin">Админы</option>
                        <option value="Manager">Менеджеры</option>
                        <option value="Employee">Сотрудники</option>
                    </select>
                    <button 
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                    >
                        + Создать
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest animate-pulse">Синхронизация...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentItems.map(user => {
                        const userName = getName(user);
                        const userRole = getRole(user);
                        const userId = user.userId || user.UserId;
                        // Форматирование даты (если она есть в модели)
                        const createdAt = user.createdAt || user.CreatedAt;
                        const dateFormatted = createdAt ? new Date(createdAt).toLocaleDateString() : 'Дата не указана';

                        return (
                            <div key={userId} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner bg-blue-50 text-blue-500 font-black">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                                        ID: {userId}
                                    </div>
                                </div>
                                
                                <h3 className="font-black text-gray-900 truncate">{userName}</h3>
                                <p className="text-gray-400 text-xs mb-1 truncate">{user.email || user.Email || "нет email"}</p>
                                
                                {/* Дата создания */}
                                <p className="text-[10px] text-gray-300 font-bold mb-4 uppercase">Создан: {dateFormatted}</p>
                                
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">
                                        {userRole}
                                    </span>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button 
                                        onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                        className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                                    >
                                        Настроить
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(userId)}
                                        className="px-3 bg-red-50 text-red-500 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-8">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border border-gray-100 rounded-xl font-bold text-gray-400 disabled:opacity-30 hover:text-blue-600 transition-colors">←</button>
                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-400'}`}>{i + 1}</button>
                        ))}
                    </div>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border border-gray-100 rounded-xl font-bold text-gray-400 disabled:opacity-30 hover:text-blue-600 transition-colors">→</button>
                </div>
            )}

            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} onSave={fetchUsers} />
        </div>
    );
};