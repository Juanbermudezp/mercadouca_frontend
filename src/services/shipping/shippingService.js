import http from '../../api/http';
export const shippingService = {
  getQuotes: (data) => http.post('/shipping/quotes', data),
  track: (provider, trackingNumber) => http.get(`/shipping/track/${provider}/${trackingNumber}`),
};
