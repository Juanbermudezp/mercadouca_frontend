import http from '../../api/http';
export const questionService = {
  getByProduct: (productId, params) => http.get(`/questions/products/${productId}`, { params }),
  ask: (productId, data) => http.post(`/questions/products/${productId}`, data),
  answer: (questionId, data) => http.post(`/questions/${questionId}/answer`, data),
};
