import api from './axiosInstance';

export const authService = {
    // Вход в систему
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Выход
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Получение данных о себе (проверка валидности токена)
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            return null;
        }
    }
};