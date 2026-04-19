import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { Layout } from './components/Layout.jsx';

// Компонент для защиты путей
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Загрузка...</div>;
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Все защищенные страницы пишем тут */}
                    <Route path="/orders" element={
                        <PrivateRoute>
                            <OrdersPage />
                        </PrivateRoute>
                    } />

                    <Route path="/customers" element={
                        <PrivateRoute>
                        </PrivateRoute>
                    } />

                    {/* Редирект с корня на заказы */}
                    <Route path="/" element={<Navigate to="/orders" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;