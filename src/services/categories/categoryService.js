import http from '../../api/http';
export const categoryService = {
  getAll: () => http.get('/categories'),
  getRoots: () => http.get('/categories/root'),
  getById: (id) => http.get(`/categories/${id}`),
  getSubs: (id) => http.get(`/categories/${id}/subcategories`),
  create: (data) => http.post('/categories', data),
  update: (id, data) => http.put(`/categories/${id}`, data),
  remove: (id) => http.delete(`/categories/${id}`),
};
