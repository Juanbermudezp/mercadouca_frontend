import http from '../../api/http';
export const orderService = {
  create: (data) => http.post('/orders', data),
  getById: (id) => http.get(`/orders/${id}`),
  getByNumber: (num) => http.get(`/orders/number/${num}`),
  getMyOrders: (params) => http.get('/orders/my', { params }),
  getSellerOrders: (params) => http.get('/orders/seller', { params }),
  updateStatus: (id, data) => http.patch(`/orders/${id}/status`, data),
  cancel: (id) => http.delete(`/orders/${id}/cancel`),
};
