import http from '../../api/http';
export const cartService = {
  get: () => http.get('/cart'),
  addItem: (data) => http.post('/cart/items', data),
  updateItem: (itemId, data) => http.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => http.delete(`/cart/items/${itemId}`),
  clear: () => http.delete('/cart'),
};
