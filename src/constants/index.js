export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
export const TOKEN_KEY = 'mercaduca_token';
export const REFRESH_KEY = 'mercaduca_refresh';
export const USER_KEY = 'mercaduca_user';

export const ROLES = { ADMIN: 'ADMIN', SELLER: 'SELLER', BUYER: 'BUYER' };

export const ORDER_STATUS = {
  PENDING: { label: 'Pendiente', color: '#f59e0b' },
  PAID: { label: 'Pagado', color: '#10b981' },
  SHIPPED: { label: 'Enviado', color: '#0065ff' },
  DELIVERED: { label: 'Entregado', color: '#059669' },
  CANCELLED: { label: 'Cancelado', color: '#ef4444' },
};

export const DISPUTE_STATUS = {
  OPEN: 'Abierta',
  UNDER_REVIEW: 'En revisión',
  RESOLVED_BUYER: 'Resuelta (comprador)',
  RESOLVED_SELLER: 'Resuelta (vendedor)',
  CLOSED: 'Cerrada',
};

export const PAYMENT_METHODS = [
  { value: 'STRIPE', label: 'Stripe (Tarjeta)' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'BANK_TRANSFER', label: 'Transferencia Bancaria' },
];

export const SHIPPING_PROVIDERS = [
  { value: 'DHL', label: 'DHL Express (3 días)' },
  { value: 'CORREOS', label: 'Correos (5-7 días)' },
  { value: 'UBER_DIRECT', label: 'Uber Direct (Hoy)' },
];

export const PAGE_SIZE = 20;
