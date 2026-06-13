export const formatCurrency = (n) => `$${(n || 0).toFixed(2)}`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('es', { year:'numeric', month:'short', day:'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('es', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

export const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff/60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff/86400)}d`;
  return formatDate(d);
};

export const truncate = (s, n = 60) => s && s.length > n ? s.slice(0, n) + '...' : s;
