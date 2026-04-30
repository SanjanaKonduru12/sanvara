import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProductImageUrl, handleProductImageError } from '../lib/productMedia';
import { SHOP_UPDATED_EVENT } from '../lib/events';
import api, { getApiErrorMessage } from '../services/api';

export default function CartPage({ auth }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!auth) {
      navigate('/login');
      return;
    }

    const loadCart = async () => {
      setError('');
      setIsLoading(true);

      try {
        const response = await api.get('/shop/cart');
        setCart(response.data);
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, 'Unable to load your cart.');
        setError(message);
        showToast({ title: 'Cart unavailable', message, tone: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [auth, navigate, showToast]);

  const handleRemove = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;

    try {
      await api.delete(`/shop/cart/${itemId}`);
      
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.id !== itemId);
        const newSubtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return {
          ...prevCart,
          items: newItems,
          subtotal: newSubtotal,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      });
      
      showToast({ title: 'Item removed', message: 'Item removed from cart', tone: 'success' });
      window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to remove item');
      showToast({ title: 'Error', message, tone: 'error' });
    }
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await api.delete(`/shop/cart/${item.id}`);
      await api.post(`/shop/wishlist?productId=${item.product.id}`);
      
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((i) => i.id !== item.id);
        const newSubtotal = newItems.reduce((sum, i) => sum + i.totalPrice, 0);
        return {
          ...prevCart,
          items: newItems,
          subtotal: newSubtotal,
          totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0)
        };
      });
      
      showToast({ title: 'Moved', message: 'Item moved to wishlist', tone: 'success' });
      window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
    } catch (err) {
      showToast({ title: 'Error', message: 'Failed to move item', tone: 'error' });
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
        <h1 className="text-2xl font-semibold text-rose-800 dark:text-rose-100">Unable to load cart</h1>
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[36px] border border-slate-200/80 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Your cart</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Review your items and proceed to checkout.</p>
        <div className="mt-8 space-y-4">
          {cart?.items?.length ? (
            cart.items.map((item) => (
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Total: ${item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => handleMoveToWishlist(item)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Your cart is empty.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[36px] border border-slate-200/80 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cart summary</p>
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">${cart?.subtotal?.toFixed(2) || '0.00'}</p>
          </div>
            <button
              onClick={() => navigate('/checkout')}
              className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-lg shadow-brand-500/30"
            >
              Buy Now
            </button>
        </div>
      </div>
    </div>
  );
}
