import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { SHOP_UPDATED_EVENT } from '../lib/events';
import { getProductImageUrl, handleProductImageError } from '../lib/productMedia';
import api, { getApiErrorMessage } from '../services/api';

function StarRating({ rating }) {
  const stars = [];
  const numRating = Number(rating || 0);
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(numRating)) {
      stars.push(<span key={i} className="star-filled">★</span>);
    } else if (i - numRating < 1 && i - numRating > 0) {
      stars.push(<span key={i} className="star-filled">★</span>);
    } else {
      stars.push(<span key={i} className="star-empty">★</span>);
    }
  }
  return <span className="flex items-center gap-0.5 text-sm">{stars}</span>;
}

export default function ProductCard({
  product,
  auth,
  isWishlisted = false,
  onToggleWishlist,
  wishlistBusy = false,
}) {
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);
  const [isCartBusy, setIsCartBusy] = useState(false);
  const [isLocalWishlistBusy, setIsLocalWishlistBusy] = useState(false);
  const { showToast } = useToast();
  const rating = Number(product.ratingAverage || 0).toFixed(1);
  const price = Number(product.price || 0).toFixed(2);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice).toFixed(2) : null;
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;
  const stockLabel = product.stockCount > 10 ? 'In stock' : product.stockCount > 0 ? 'Low stock' : 'Out of stock';
  const stockColor =
    product.stockCount > 10
      ? 'bg-emerald-500/90 text-white'
      : product.stockCount > 0
        ? 'bg-amber-500/90 text-white'
        : 'bg-red-500/90 text-white';
  const isWishlistActive = onToggleWishlist ? isWishlisted : localWishlisted;
  const isWishlistDisabled = onToggleWishlist ? wishlistBusy : isLocalWishlistBusy;
  const hasAuth = Boolean(auth || localStorage.getItem('lm_token'));

  useEffect(() => {
    setLocalWishlisted(isWishlisted);
  }, [isWishlisted]);

  const handleAddToCart = async () => {
    if (!hasAuth) {
      showToast({ title: 'Login required', message: 'Please sign in to add items to your cart.', tone: 'error' });
      return;
    }

    setIsCartBusy(true);
    try {
      await api.post('/shop/cart', {
        productId: product.id,
        quantity: 1,
        sizeOption: 'M',
        colorOption: 'Black',
      });
      showToast({ title: 'Added to cart', message: `${product.name} is now in your cart.`, tone: 'success' });
      window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
    } catch (error) {
      showToast({ title: 'Cart update failed', message: getApiErrorMessage(error, 'Unable to add item to cart.'), tone: 'error' });
    } finally {
      setIsCartBusy(false);
    }
  };

  const handleWishlistClick = async () => {
    if (onToggleWishlist) {
      onToggleWishlist(product);
      return;
    }

    if (!hasAuth) {
      showToast({ title: 'Login required', message: 'Please sign in to manage your wishlist.', tone: 'error' });
      return;
    }

    setIsLocalWishlistBusy(true);
    try {
      if (localWishlisted) {
        await api.delete(`/shop/wishlist/${product.id}`);
        setLocalWishlisted(false);
        showToast({ title: 'Removed', message: 'Removed from wishlist.', tone: 'success' });
      } else {
        await api.post('/shop/wishlist', null, { params: { productId: product.id } });
        setLocalWishlisted(true);
        showToast({ title: 'Saved', message: 'Added to wishlist.', tone: 'success' });
      }
      window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
    } catch (error) {
      showToast({ title: 'Wishlist update failed', message: getApiErrorMessage(error, 'Unable to update wishlist.'), tone: 'error' });
    } finally {
      setIsLocalWishlistBusy(false);
    }
  };

  return (
    <article className="group surface-card overflow-hidden p-4 transition duration-300 hover:-translate-y-2 hover:shadow-lg">
      <div className="relative">
        <Link to={`/products/${product.id}`} title={product.name}>
          <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[24px] bg-[var(--color-surface-muted)]">
            <img
              src={getProductImageUrl(product)}
              alt={product.name}
              onError={handleProductImageError}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Badges */}
            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm dark:bg-slate-950/80 dark:text-white">
                {product.category?.name || 'General'}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${stockColor}`}>
                {stockLabel}
              </span>
            </div>

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute left-3 bottom-3">
                <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                  -{discount}% OFF
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Wishlist toggle */}
        {(onToggleWishlist || hasAuth) && (
          <button
            type="button"
            disabled={isWishlistDisabled}
            onClick={handleWishlistClick}
            className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
              isWishlistActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500 dark:bg-slate-950/85 dark:text-white'
            } disabled:cursor-not-allowed disabled:opacity-60`}
            title={isWishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlistActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Brand */}
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
          {product.brand}
        </p>

        {/* Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="text-base font-semibold text-[var(--color-text)] line-clamp-2 transition hover:text-[var(--color-accent)]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating rating={rating} />
          <span className="text-xs text-[var(--color-text-soft)]">
            {rating} ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <p className="text-lg font-bold text-[var(--color-text)]">${price}</p>
          {compareAtPrice && (
            <p className="text-sm text-[var(--color-text-soft)] line-through">${compareAtPrice}</p>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isCartBusy || product.stockCount <= 0}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCartBusy ? 'Adding...' : 'Add to cart'}
          </button>
          <button
            type="button"
            onClick={handleWishlistClick}
            disabled={isWishlistDisabled}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
              isWishlistActive
                ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            } disabled:cursor-not-allowed disabled:opacity-60`}
            title={isWishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlistActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
