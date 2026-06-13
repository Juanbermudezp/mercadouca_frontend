import http from '../../api/http';
export const reviewService = {
  create: (data) => http.post('/reviews', data),
  getByProduct: (productId, params) => http.get(`/reviews/product/${productId}`, { params }),
  addSellerResponse: (reviewId, data) => http.post(`/reviews/${reviewId}/response`, data),
};
