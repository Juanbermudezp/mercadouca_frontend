import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, Star, ShoppingBag, Eye } from 'lucide-react';
import { sellerService } from '../../services/seller/sellerService';
import { Card, Spinner } from '../../components/common/UI';
import styles from './SellerPage.module.css';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
      <div style={{
        background: color + '18', color,
        borderRadius: 'var(--radius)', padding: 10, flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{value ?? '—'}</p>
      </div>
    </Card>
  );
}

export default function SellerReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Usa el endpoint propio del vendedor (no el de admin)
    sellerService.getMyReport()
      .then(r => setData(r.data))
      .catch(() => setError(
        'No se pudo cargar el reporte. Verifica que tu cuenta de vendedor esté aprobada.'
      ))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner size={36} /></div>;

  if (error) return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi Reporte</h1>
      <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>{error}</p>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mi Reporte</h1>
          <p className={styles.sub}>Estadísticas de tu tienda en Mercaduca</p>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatCard icon={DollarSign} label="Ingresos totales"
          value={`$${data?.totalRevenue?.toFixed(2) || '0.00'}`} color="#059669" />
        <StatCard icon={ShoppingBag} label="Total de órdenes"
          value={data?.totalOrders} color="var(--b300)" />
        <StatCard icon={Package} label="Productos activos"
          value={data?.activeProducts} color="#8b5cf6" />
        <StatCard icon={Star} label="Calificación promedio"
          value={data?.averageRating?.toFixed(1)} color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Total de reseñas"
          value={data?.totalReviews} color="#10b981" />
        <StatCard icon={Eye} label="Vistas de productos"
          value={data?.totalViews?.toLocaleString()} color="#6366f1" />
      </div>

      {data?.topProducts && data.topProducts.length > 0 && (
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
            <TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Productos más vendidos
          </h3>
          {data.topProducts.map((p, i) => (
            <div key={p.productId || i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', width: 24 }}>
                #{i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {p.productTitle}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {p.totalSold} vendidos · ${p.revenue?.toFixed(2) || '0.00'} ingresos
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {data?.recentOrders && data.recentOrders.length > 0 && (
        <Card style={{ padding: 20, marginTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Órdenes recientes</h3>
          {data.recentOrders.map((o, i) => (
            <div key={o.orderId || i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>#{o.orderNumber}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {o.buyerName} · {new Date(o.createdAt).toLocaleDateString('es')}
                </p>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--b300)' }}>
                ${o.total?.toFixed(2)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
