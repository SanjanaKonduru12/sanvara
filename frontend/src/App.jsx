import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OccasionPage from './pages/OccasionPage';
import ProductsPage from './pages/ProductsPage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AUTH_EXPIRED_EVENT } from './lib/events';

function readStoredAuth() {
  const token = localStorage.getItem('lm_token');
  const user = localStorage.getItem('lm_user');

  if (!token || !user) {
    return null;
  }

  try {
    return { token, user: JSON.parse(user) };
  } catch (error) {
    console.warn('Failed to read stored auth state.', error);
    return null;
  }
}

function App() {
  const [auth, setAuth] = useState(readStoredAuth);

  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('lm_theme');
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lm_theme', theme);
  }, [theme]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth) {
      localStorage.setItem('lm_token', auth.token);
      localStorage.setItem('lm_user', JSON.stringify(auth.user));
    } else {
      localStorage.removeItem('lm_token');
      localStorage.removeItem('lm_user');
    }
  }, [auth]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setAuth(null);
      const redirect = `${location.pathname}${location.search}`;
      navigate(`/login?reason=session-expired&redirect=${encodeURIComponent(redirect)}`, {
        replace: true,
      });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);
  }, [location.pathname, location.search, navigate]);

  const handleAuthSuccess = (authData, redirectTo = '/profile') => {
    setAuth(authData);
    navigate(redirectTo || '/profile', { replace: true });
  };

  const handleLogout = () => {
    setAuth(null);
    navigate('/', { replace: true });
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const appShellClassName = useMemo(
    () => 'min-h-screen bg-[var(--color-app-bg)] text-[var(--color-text)] transition-colors duration-300',
    [],
  );

  return (
    <ToastProvider>
      <div className={appShellClassName}>
        <Navbar auth={auth} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<HomePage auth={auth} />} />
            <Route path="/login" element={<LoginPage auth={auth} onLogin={handleAuthSuccess} />} />
            <Route path="/register" element={<RegisterPage auth={auth} onRegister={handleAuthSuccess} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/products" element={<ProductsPage auth={auth} />} />
            <Route path="/categories/:categorySlug" element={<CategoryPage auth={auth} />} />
            <Route path="/products/:id" element={<ProductDetailPage auth={auth} />} />
            <Route path="/occasions/:occasionSlug" element={<OccasionPage auth={auth} />} />
            <Route
              path="/cart"
              element={(
                <ProtectedRoute auth={auth}>
                  <CartPage auth={auth} />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/checkout"
              element={(
                <ProtectedRoute auth={auth}>
                  <CheckoutPage auth={auth} />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/wishlist"
              element={(
                <ProtectedRoute auth={auth}>
                  <WishlistPage auth={auth} />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute auth={auth}>
                  <ProfilePage auth={auth} />
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
