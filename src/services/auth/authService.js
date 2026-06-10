import http from '../../api/http';
export const authService = {
  login: (data) => http.post('/auth/login', data),
  register: (data) => http.post('/auth/register', data),
  refresh: (refreshToken) => http.post('/auth/refresh', { refreshToken }),
};
