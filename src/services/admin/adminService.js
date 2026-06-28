import http from '../../api/http';

export const adminService = {
  // Dashboard
  getDashboard: () => http.get('/admin/reports/dashboard'),
  getSellerReport: (id) => http.get(`/admin/reports/sellers/${id}`),

  // Órdenes
  getAllOrders: (params) => http.get('/admin/orders', { params }),
  getOrdersByStatus: (status, params) => http.get(`/admin/orders/status/${status}`, { params }),
  searchOrders: (keyword, params) => http.get('/admin/orders/search', { params: { keyword, ...params } }),

  // Vendedores
  getAllSellers: (params) => http.get('/admin/sellers', { params }),
  getPendingSellers: (params) => http.get('/admin/sellers/pending', { params }),
  approveSeller: (id) => http.patch(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => http.patch(`/admin/sellers/${id}/reject`, null, { params: { reason } }),
  suspendSeller: (id, reason) => http.patch(`/admin/sellers/${id}/suspend`, null, { params: { reason } }),
  blockSeller: (id, reason) => http.patch(`/admin/sellers/${id}/block`, null, { params: { reason } }),
  unblockSeller: (id) => http.patch(`/admin/sellers/${id}/unblock`),

  // Advertencias
  warnSeller: (id, reason) => http.post(`/admin/users/${id}/warn`, { reason }),
  getSellerWarnings: (id) => http.get(`/admin/users/${id}/warnings`),

  // Usuarios
  getAllUsers: (params) => http.get('/admin/users', { params }),
  getUserById: (id) => http.get(`/admin/users/${id}`),
  toggleUserStatus: (id) => http.patch(`/admin/users/${id}/toggle-status`),
};
