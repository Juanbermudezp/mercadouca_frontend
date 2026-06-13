import http from '../../api/http';
export const chatService = {
  send: (data) => http.post('/chat/messages', data),
  getConversations: () => http.get('/chat/conversations'),
  getMessages: (convId, params) => http.get(`/chat/conversations/${convId}/messages`, { params }),
  markRead: (convId) => http.patch(`/chat/conversations/${convId}/read`),
};
