export const SHOP_UPDATED_EVENT = 'lm:shop-updated';
export const AUTH_EXPIRED_EVENT = 'lm:auth-expired';

export function emitShopUpdate() {
  window.dispatchEvent(new CustomEvent(SHOP_UPDATED_EVENT));
}

export function emitAuthExpired() {
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}
