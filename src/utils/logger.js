import { toast } from 'react-hot-toast';

export const logActivity = (action, entityName, entityId = "N/A") => {
    // 1. Показываем тостер (Лаба 14.1)
    toast.success(`${action}: ${entityName}`, {
        style: { borderRadius: '15px', background: '#333', color: '#fff' }
    });

    // 2. Создаем объект лога
    const newLog = {
        id: Date.now(),
        userName: localStorage.getItem('userName') || 'Admin', // Имя из сессии
        action: action, // например, "Создание" или "Удаление"
        entityName: entityName, // например, "Товар: iPhone 15"
        entityId: entityId,
        timestamp: new Date().toISOString()
    };

    // 3. Сохраняем в localStorage (имитация БД для лабы)
    const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    localStorage.setItem('activityLogs', JSON.stringify([newLog, ...existingLogs]));
};