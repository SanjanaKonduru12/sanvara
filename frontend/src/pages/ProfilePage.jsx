import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductGridSkeleton } from '../components/LoadingSkeletons';
import api, { getApiErrorMessage } from '../services/api';

export default function ProfilePage({ auth }) {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [dashRes, ordersRes] = await Promise.all([
          api.get('/shop/dashboard'),
          api.get('/shop/orders'),
        ]);
        setDashboard(dashRes.data);
        setOrders(ordersRes.data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Unable to load profile data.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-8">
        <ProductGridSkeleton count={3} />
      </section>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl rounded-[32px] border border-rose-200 bg-rose-50 p-8 shadow-soft dark:border-rose-500/30 dark:bg-rose-500/10">
        <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-100">Unable to load profile</h2>
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-200">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const cancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      
      const dashRes = await api.get('/shop/dashboard');
      const ordersRes = await api.get('/shop/orders');
      
      setDashboard(dashRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to cancel order', err);
    }
  };

  const user = auth?.user;

  return (
    <section className="space-y-8">
      {/* Profile Header */}
      <div className="overflow-hidden rounded-[36px] border border-slate-200/70 bg-[linear-gradient(135deg,_rgba(37,99,235,0.95),_rgba(15,23,42,0.92))] px-8 py-10 text-white shadow-soft sm:px-12">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur-sm">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-semibold">
              {user?.firstName || 'User'} {user?.lastName || ''}
            </h1>
            <p className="mt-1 text-sm text-slate-200">{user?.email || 'No email'}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cart Items" value={dashboard?.cart?.totalItems || 0} icon="🛒" />
        <StatCard label="Wishlist" value={dashboard?.wishlistCount || 0} icon="❤️" />
        <StatCard label="Orders" value={orders?.length || 0} icon="📦" />
        <StatCard
          label="Total Spent"
          value={`$${(orders || []).reduce((sum, o) => sum + Number(o.totalAmount || 0), 0).toFixed(2)}`}
          icon="💰"
        />
      </div>

      {/* Order History */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">History</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your Orders</h2>
          </div>
          <Link
            to="/products"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            Continue Shopping
          </Link>
        </div>

        {(!orders || orders.length === 0) ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">No orders yet</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Start shopping and your orders will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Order #{order.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {['PLACED', 'PENDING'].includes(order.status) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="mt-1 text-xs font-medium text-rose-500 hover:text-rose-600 hover:underline dark:text-rose-400 dark:hover:text-rose-300"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {order.status || 'PLACED'}
                    </span>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {item.productName || `Product #${item.productId}`} × {item.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-soft transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
