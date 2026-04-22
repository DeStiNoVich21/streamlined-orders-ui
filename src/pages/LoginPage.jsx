import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
// --- ИМПОРТ ДЛЯ ЛОГИРОВАНИЯ ---
import { logActivity } from '../utils/logger';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            
            // --- ЛОГИРОВАНИЕ УСПЕШНОГО ВХОДА ---
            logActivity('Авторизация', `Пользователь ${username} вошел в систему`);
            
            navigate('/orders');
        } catch (err) {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Вход в ERP</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Логин</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Пароль</label>
                        <input 
                            type="password" 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">{error}</p>}
                    <button 
                        type="submit" 
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
};