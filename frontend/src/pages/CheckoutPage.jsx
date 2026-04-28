import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api, { getApiErrorMessage } from '../services/api';

export default function CheckoutPage({ auth }) {
  const [details, setDetails] = useState({
    shippingName: '',
    phone: '',
    shippingAddress: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'Cash on Delivery (COD)',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const nextMessage = getApiErrorMessage(requestError, 'Unable to load checkout details.');
        setError(nextMessage);
        showToast({ title: 'Checkout unavailable', message: nextMessage, tone: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [auth, navigate, showToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      await api.post('/orders/place', details);
      setMessage('Order placed successfully!');
      setCart(null);
      showToast({ title: 'Order placed', message: 'Your checkout completed successfully.', tone: 'success' });
      navigate('/profile');
    } catch (requestError) {
      const nextMessage = getApiErrorMessage(requestError, 'Unable to complete checkout.');
      setMessage(nextMessage);
      showToast({ title: 'Checkout failed', message: nextMessage, tone: 'error' });
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-2xl font-semibold text-rose-800 dark:text-rose-100">Unable to load checkout</h1>
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[520px_1fr]">
      <section className="rounded-[36px] border border-slate-200/80 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Checkout</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Confirm delivery details and complete your order.</p>

        {cart?.items?.length ? (
          <div className="mt-8 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-white">{item.product.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Order total</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">${cart.subtotal.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Your cart is empty.
          </div>
        )}
      </section>

      <form onSubmit={placeOrder} className="rounded-[36px] border border-slate-200/80 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <div className="grid gap-5">
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            <span className="mb-2 block">Recipient name</span>
            <input
              name="shippingName"
              value={details.shippingName}
              onChange={handleChange}
              className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950"
            />
          </label>
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            <span className="mb-2 block">Email</span>
            <input
              type="email"
              value={auth?.user?.email || ''}
              readOnly
              className="w-full bg-slate-100 px-4 py-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
            />
          </label>
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            <span className="mb-2 block">Phone</span>
            <input
              name="phone"
              value={details.phone}
              onChange={handleChange}
              className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950"
            />
          </label>
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            <span className="mb-2 block">Address</span>
            <textarea
              name="shippingAddress"
              value={details.shippingAddress}
              onChange={handleChange}
              className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950"
              rows="3"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-700 dark:text-slate-300">
              <span className="mb-2 block">City</span>
              <input name="city" value={details.city} onChange={handleChange} className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950" />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-300">
              <span className="mb-2 block">State</span>
              <input name="state" value={details.state} onChange={handleChange} className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950" />
            </label>
          </div>
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            <span className="mb-2 block">Postal code</span>
            <input name="postalCode" value={details.postalCode} onChange={handleChange} className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950" />
          </label>
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            <span className="mb-2 block">Payment method</span>
            <select name="paymentMethod" value={details.paymentMethod} onChange={handleChange} className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <option>Cash on Delivery (COD)</option>
              <option>Online Payment</option>
            </select>
          </label>
          {message && <p className="text-sm text-red-600 dark:text-rose-200">{message}</p>}
          <button
            type="submit"
            disabled={isSubmitting || !cart?.items?.length}
            className="inline-flex w-full justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <LoadingSpinner inline /> : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
