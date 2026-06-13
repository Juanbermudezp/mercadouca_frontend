import http from '../../api/http';

export const sellerService = {
  /** Obtener reporte/dashboard de la propia tienda del vendedor */
  getMyReport: () => http.get('/seller/reports'),

  /** Solicitar convertirse en vendedor (BUYER envía esta petición) */
  requestSellerStatus: (data) => http.post('/sellers/register', data),
};
