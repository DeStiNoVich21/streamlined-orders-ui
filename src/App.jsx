import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { CustomersPage } from './pages/CustomersPage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { EmployeesPage } from './pages/EmployeesPage.jsx'; // 1. Импорт новой страницы
import { Layout } from './components/Layout.jsx';
import { PickupPointsPage } from './pages/PickupPointsPage.jsx';
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center font-bold italic text-gray-400">Загрузка системы...</div>;
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route path="/orders" element={
                        <PrivateRoute><OrdersPage /></PrivateRoute>
                    } />

                    <Route path="/customers" element={
                        <PrivateRoute><CustomersPage /></PrivateRoute>
                    } />

                    <Route path="/products" element={
                        <PrivateRoute><ProductsPage /></PrivateRoute>
                    } />

                    {/* 2. Новый маршрут для сотрудников */}
                    <Route path="/employees" element={
                        <PrivateRoute><EmployeesPage /></PrivateRoute>
                    } />
                    <Route path="/points" element={
                        <PrivateRoute><PickupPointsPage /></PrivateRoute>
                    } />

                    <Route path="/" element={<Navigate to="/orders" />} />
                    
                    {/* fallback route */}
                    <Route path="*" element={<Navigate to="/orders" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;