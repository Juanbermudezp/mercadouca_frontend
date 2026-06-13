import http from '../../api/http';

export const productService = {
  getAll: (params) => http.get('/products/search', { params }),
  getById: (id) => http.get(`/products/${id}`),
  create: (data) => http.post('/products', data),
  update: (id, data) => http.put(`/products/${id}`, data),
  remove: (id) => http.delete(`/products/${id}`),
  ban: (id) => http.patch(`/products/${id}/ban`),
  restore: (id) => http.patch(`/products/${id}/restore`),
  getBySeller: (sellerId, params) => http.get(`/products/seller/${sellerId}`, { params }),
};
