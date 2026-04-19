import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LoginPage } from './pages/LoginPage.jsx';

// Защищенный роут (если не залогинен — редирект на логин)
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Загрузка...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/orders" element={
                        <PrivateRoute>
                            <h1>Список заказов (виден только авторизованным)</h1>
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/orders" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;