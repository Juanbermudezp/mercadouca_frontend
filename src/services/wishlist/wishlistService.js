import http from '../../api/http';
export const wishlistService = {
  getAll: (params) => http.get('/wishlist', { params }),
  add: (productId) => http.post(`/wishlist/products/${productId}`),
  remove: (productId) => http.delete(`/wishlist/products/${productId}`),
  check: (productId) => http.get(`/wishlist/products/${productId}/check`),
};
