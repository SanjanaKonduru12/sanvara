import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { HeroSkeleton } from '../components/LoadingSkeletons';
import { getProductImageUrl, handleProductImageError } from '../lib/productMedia';
import { SHOP_UPDATED_EVENT } from '../lib/events';
import api, { getApiErrorMessage } from '../services/api';

function PriceTrendChart({ points }) {
  if (!points.length) return null;
  const max = Math.max(...points.map((point) => Number(point.price)));
  const min = Math.min(...points.map((point) => Number(point.price)));
  const range = Math.max(max - min, 1);

  return (
    <svg viewBox="0 0 320 120" className="w-full overflow-visible">
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth="4"
        points={points
          .map((point, index) => {
            const x = (index * 320) / (points.length - 1 || 1);
            const y = 110 - ((point.price - min) / range) * 90;
            return `${x},${y}`;
          })
          .join(' ')}
      />
    </svg>
  );
}

export default function ProductDetailPage({ auth }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Unable to load the product.'));
      } finally {
        setIsLoading(false);
      }
    };

    const loadWishlistStatus = async () => {
      if (!auth) return;
      try {
        const res = await api.get('/shop/wishlist');
        setIsWishlisted(res.data.some((w) => String(w.product.id) === String(id)));
      } catch (err) {
        console.warn('Failed to load wishlist status', err);
      }
    };

    loadProduct();
    loadWishlistStatus();
  }, [id, auth]);

  const addToCart = async () => {
    setMessage('');

    try {
      await api.post('/shop/cart', {
        productId: product.product.id,
        quantity,
        sizeOption: selectedSize,
        colorOption: selectedColor,
      });
      setMessage('Added to cart successfully.');
      showToast({ title: 'Added to cart', message: `${product.product.name} is now in your cart.`, tone: 'success' });
      window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
    } catch (requestError) {
      const nextMessage = getApiErrorMessage(requestError, 'Unable to add item.');
      setMessage(nextMessage);
      showToast({ title: 'Cart update failed', message: nextMessage, tone: 'error' });
    }
  };

  const handleWishlist = async () => {
    if (!auth) {
      showToast({ title: 'Authentication required', message: 'Please log in to add to wishlist.', tone: 'error' });
      return;
    }

    setWishlistBusy(true);
    try {
      if (isWishlisted) {
        await api.delete(`/shop/wishlist/${id}`);
        setIsWishlisted(false);
        showToast({ title: 'Success', message: 'Removed from Wishlist', tone: 'success' });
      } else {
        await api.post(`/shop/wishlist?productId=${id}`);
        setIsWishlisted(true);
        showToast({ title: 'Success', message: 'Added to Wishlist', tone: 'success' });
      }
      window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
    } catch (err) {
      showToast({ title: 'Error', message: 'Failed to update wishlist.', tone: 'error' });
    } finally {
      setWishlistBusy(false);
    }
  };

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 shadow-soft dark:border-rose-500/30 dark:bg-rose-500/10">
        <h2 className="text-2xl font-semibold text-rose-800 dark:text-rose-100">Unable to load product</h2>
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-200">{error || 'The product is unavailable right now.'}</p>
        <Link to="/products" className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[420px_1fr]">
      <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
        <img
          src={getProductImageUrl(product.product)}
          alt={product.product.name}
          onError={handleProductImageError}
          className="w-full rounded-3xl object-cover"
        />
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Price insight</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">${Number(product.priceInsight.currentPrice).toFixed(2)}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{product.priceInsight.recommendation}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Price trend</h3>
            <div className="mt-4 h-32">
              {product.priceInsight.history.length ? (
                <PriceTrendChart points={product.priceInsight.history} />
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No trend data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{product.product.brand}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{product.product.category.name}</span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
            {product.product.subcategory}
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">{product.product.name}</h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {product.product.occasions?.map((occasion) => (
            <span
              key={occasion}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              {occasion}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Size</p>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="mt-3 w-full bg-slate-50 px-4 py-3 dark:bg-slate-950">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Color</p>
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="mt-3 w-full bg-slate-50 px-4 py-3 dark:bg-slate-950">
              {['Black', 'White', 'Navy', 'Red'].map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-24 bg-slate-50 px-4 py-3 dark:bg-slate-950"
          />
          <button onClick={addToCart} className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
            Add to cart
          </button>
          <button
            onClick={handleWishlist}
            disabled={wishlistBusy}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {isWishlisted ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>}
        <div className="mt-10 grid gap-6">
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Reviews</p>
            <p className="mt-2 text-base text-slate-700 dark:text-slate-300">
              {product.reviews.length} reviews | {product.product.ratingAverage.toFixed(1)} stars
            </p>
          </div>
          <div className="space-y-4">
            {product.reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{review.reviewerName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{review.createdAt.split('T')[0]}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-200">{review.rating} stars</span>
                </div>
                <p className="mt-3 text-base text-slate-800 dark:text-slate-100">{review.title}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
