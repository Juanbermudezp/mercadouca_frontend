import http from '../../api/http';
export const couponService = {
  create:            (data)      => http.post('/coupons', data),
  validate:          (data)      => http.post('/coupons/validate', data),
  getMine:           (params)    => http.get('/coupons/my', { params }),
  deactivate:        (id)        => http.delete('/coupons/' + id),
  deletePermanently: (id)        => http.delete('/coupons/' + id + '/permanent'),
};
