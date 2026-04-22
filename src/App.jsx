import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { CustomersPage } from './pages/CustomersPage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { EmployeesPage } from './pages/EmployeesPage.jsx';
import { PickupPointsPage } from './pages/PickupPointsPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx'; // 1. Импорт страницы пользователей
import { Layout } from './components/Layout.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx'; // <--- ДОБАВЛЕНО
import { Toaster } from 'react-hot-toast';
import { ActivityLogPage } from './pages/ActivityLogPage';

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="flex h-screen items-center justify-center font-bold italic text-gray-400">Загрузка системы...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    // Проверка прав доступа, если роли переданы
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/orders" />;
    }
    
    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <>
      <Toaster position="top-right" reverseOrder={false} />
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                    <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
                    <Route path="/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
                    <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
                    <Route path="/points" element={<PrivateRoute><PickupPointsPage /></PrivateRoute>} />
                    
                    {/* Сотрудники доступны Админу и Менеджеру */}
                    <Route path="/employees" element={
                        <PrivateRoute roles={['Admin', 'Manager']}><EmployeesPage /></PrivateRoute>
                    } />

                    {/* 2. Пользователи доступны ТОЛЬКО Админу */}
                    <Route path="/users" element={
                        <PrivateRoute roles={['Admin']}><UsersPage /></PrivateRoute>
                    } />
                   
                    {/* 3. Лог активностей доступен ТОЛЬКО Админу */}
                    <Route path="/activity-log" element={
                        <PrivateRoute roles={['Admin']}><ActivityLogPage /></PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/orders" />} />
                    <Route path="*" element={<Navigate to="/orders" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
        </>
    );
}

export default App;