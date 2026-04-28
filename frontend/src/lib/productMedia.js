export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80';

export function getProductImageUrl(product) {
  return product?.imageUrl || product?.category?.imageUrl || FALLBACK_PRODUCT_IMAGE;
}

export function handleProductImageError(event) {
  if (event.currentTarget.dataset.fallbackApplied === 'true') {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
}
