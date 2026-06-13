import http from '../../api/http';
export const notificationService = {
  getAll: (params) => http.get('/notifications', { params }),
  getUnreadCount: () => http.get('/notifications/unread-count'),
  markAllRead: () => http.patch('/notifications/read-all'),
};
