import http from '../../api/http';
export const addressService = {
  getAll: () => http.get('/addresses'),
  create: (data) => http.post('/addresses', data),
  update: (id, data) => http.put(`/addresses/${id}`, data),
  remove: (id) => http.delete(`/addresses/${id}`),
  setDefault: (id) => http.patch(`/addresses/${id}/default`),
};
