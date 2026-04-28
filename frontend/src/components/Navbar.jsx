import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SHOP_UPDATED_EVENT } from '../lib/events';

function NavPill({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `nav-pill ${isActive ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]' : ''}`}
    >
      {children}
    </NavLink>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Navbar({ auth, onLogout, theme, toggleTheme }) {
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ cartCount: 0, wishlistCount: 0 });
  const [query, setQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('query') || '');
  }, [location.search]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.slice(0, 6));
      } catch (error) {
        console.warn('Unable to load categories for the navbar.', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!auth) {
      setSummary({ cartCount: 0, wishlistCount: 0 });
      return undefined;
    }

    const loadSummary = async () => {
      try {
        const response = await api.get('/shop/dashboard');
        setSummary({
          cartCount: response.data?.cart?.totalItems || 0,
          wishlistCount: response.data?.wishlistCount || 0,
        });
      } catch (error) {
        console.warn('Unable to load shopping summary.', error);
      }
    };

    loadSummary();
    window.addEventListener(SHOP_UPDATED_EVENT, loadSummary);
    return () => window.removeEventListener(SHOP_UPDATED_EVENT, loadSummary);
  }, [auth]);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextQuery = query.trim();
    const nextUrl = nextQuery ? `/products?query=${encodeURIComponent(nextQuery)}` : '/products';
    navigate(nextUrl);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_var(--color-accent),_#0f172a)] text-white shadow-soft">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M15 8a4 4 0 1 0-8 0c0 4 8 3 8 7a4 4 0 1 1-8 0" />
              </svg>
            </span>
            <span className="hidden sm:block">
              <span className="block text-lg font-semibold text-[var(--color-text)]">Sanvara</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
                Premium fashion & tech
              </span>
            </span>
          </Link>

          {/* Search Bar — Desktop */}
          <form onSubmit={handleSearch} className="hidden min-w-[260px] flex-1 lg:block">
            <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2.5">
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, brands..."
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm focus:ring-0"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex ml-auto">
            <NavPill to="/">Home</NavPill>
            <NavPill to="/products">Shop</NavPill>
            <NavPill to="/wishlist">
              <span className="flex items-center gap-1.5">
                <HeartIcon />
                Wishlist
                {summary.wishlistCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-bold text-white">
                    {summary.wishlistCount}
                  </span>
                )}
              </span>
            </NavPill>
            <NavPill to="/cart">
              <span className="flex items-center gap-1.5">
                <CartIcon />
                Cart
                {summary.cartCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-bold text-white">
                    {summary.cartCount}
                  </span>
                )}
              </span>
            </NavPill>
            {auth && (
              <NavPill to="/profile">
                <span className="flex items-center gap-1.5">
                  <UserIcon /> Profile
                </span>
              </NavPill>
            )}

            {/* Theme Toggle */}
            <button type="button" onClick={toggleTheme} className="theme-toggle ml-1" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Auth */}
            {auth ? (
              <>
                <span className="ml-2 rounded-full bg-[var(--color-surface-muted)] px-4 py-2 text-sm text-[var(--color-text-soft)]">
                  Hi, {auth.user?.firstName || 'Shopper'}
                </span>
                <button type="button" onClick={onLogout} className="btn-secondary">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-pill ml-1">Login</Link>
                <Link to="/register" className="btn-primary">Create account</Link>
              </>
            )}
          </nav>

          {/* Mobile Controls */}
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <button type="button" onClick={toggleTheme} className="theme-toggle" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button type="button" onClick={() => setIsMenuOpen((current) => !current)} className="icon-button">
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Category bar — Desktop */}
        <div className="mt-3 hidden flex-wrap gap-2 lg:flex">
          {categories.map((category) => (
            <Link key={category.id} to={`/categories/${category.slug}`} className="pill">
              {category.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 space-y-4 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-soft lg:hidden">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2.5">
                <SearchIcon />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the catalog"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm focus:ring-0"
                />
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
              <NavPill to="/" onClick={() => setIsMenuOpen(false)}>Home</NavPill>
              <NavPill to="/products" onClick={() => setIsMenuOpen(false)}>Shop</NavPill>
              <NavPill to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                <span className="flex items-center gap-1.5">
                  <HeartIcon /> Wishlist
                  {summary.wishlistCount > 0 && <span className="text-xs">({summary.wishlistCount})</span>}
                </span>
              </NavPill>
              <NavPill to="/cart" onClick={() => setIsMenuOpen(false)}>
                <span className="flex items-center gap-1.5">
                  <CartIcon /> Cart
                  {summary.cartCount > 0 && <span className="text-xs">({summary.cartCount})</span>}
                </span>
              </NavPill>
              {auth && <NavPill to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</NavPill>}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link key={category.id} to={`/categories/${category.slug}`} className="pill" onClick={() => setIsMenuOpen(false)}>
                  {category.name}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {auth ? (
                <button type="button" onClick={() => { onLogout(); setIsMenuOpen(false); }} className="btn-secondary">
                  Sign out
                </button>
              ) : (
                <>
                  <Link to="/login" className="nav-pill" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary" onClick={() => setIsMenuOpen(false)}>Create account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
