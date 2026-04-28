import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProductImageUrl, handleProductImageError } from '../lib/productMedia';
import { SHOP_UPDATED_EVENT } from '../lib/events';
import api, { getApiErrorMessage } from '../services/api';

export default function WishlistPage({ auth }) {
  const [wishlist, setWishlist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!auth) {
      navigate('/login');
      return;
    }

    const loadWishlist = async () => {
      setError('');
      setIsLoading(true);

      try {
        const response = await api.get('/shop/wishlist');
        setWishlist(response.data);
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, 'Unable to load your wishlist.');
        setError(message);
        showToast({ title: 'Wishlist unavailable', message, tone: 'error' });
      } finally {
        setIsLoading(false);
      }
    };


    loadWishlist();
  }, [auth, navigate, showToast]);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/shop/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
      showToast({ title: 'Success', message: 'Removed from Wishlist', tone: 'success' });
      window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
    } catch (err) {
      showToast({ title: 'Error', message: 'Failed to remove from wishlist', tone: 'error' });
    }
  };

  if (!auth) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="rounded-[36px] border border-rose-200 bg-rose-50 p-8 shadow-soft dark:border-rose-500/30 dark:bg-rose-500/10">
        <h1 className="text-2xl font-semibold text-rose-800 dark:text-rose-100">Unable to load wishlist</h1>
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[36px] border border-slate-200/80 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Wishlist</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Keep your favorite styles for later.</p>
      <div className="mt-8 space-y-4">
        {wishlist?.length ? (
          wishlist.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={getProductImageUrl(item.product)}
                  alt={item.product.name}
                  onError={handleProductImageError}
                  className="h-24 w-24 rounded-3xl object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.product.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.product.brand}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                >
                  Remove
                </button>
                <button
                  onClick={() => navigate(`/products/${item.product.id}`)}
                  className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  View product
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Your wishlist is empty.
          </div>
        )}
      </div>
    </div>
  );
}
