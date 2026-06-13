import http from '../../api/http';

export const disputeService = {
  // Comprador
  open: (orderId, data) => http.post(`/disputes/orders/${orderId}`, data),
  getMine: (params) => http.get('/disputes/my', { params }),

  // Vendedor
  getSellerDisputes: (params) => http.get('/disputes/seller', { params }),
  sellerRespond: (id, data) => http.patch(`/disputes/${id}/seller-response`, data),

  // Admin
  getAll: (params) => http.get('/disputes', { params }),
  resolve: (id, data) => http.patch(`/disputes/${id}/resolve`, data),

  // Compartido
  getById: (id) => http.get(`/disputes/${id}`),
};
