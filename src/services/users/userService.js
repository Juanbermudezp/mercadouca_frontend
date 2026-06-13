import http from '../../api/http';
export const userService = {
  getMe: () => http.get('/users/me'),
  updateMe: (data) => http.put('/users/me', data),
  changePassword: (data) => http.patch('/users/me/password', data),
  registerAsSeller: (data) => http.post('/sellers/register', data),
  search: (keyword) => http.get('/users/search', { params: { keyword } }),
};
