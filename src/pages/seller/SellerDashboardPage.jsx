import { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, Package, Star,
  ShoppingBag, Eye, AlertCircle, BarChart2,
} from 'lucide-react';
import { sellerService } from '../../services/seller/sellerService';
import { useAuth } from '../../context/AuthContext';
import { Card, Spinner, Badge } from '../../components/common/UI';
import styles from './SellerPage.module.css';

const STATUS_COLOR = {
  PAID: 'green', SHIPPED: 'blue', DELIVERED: 'green',
  PENDING: 'orange', CANCELLED: 'red',
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
      <div style={{
        background: color + '18', color, borderRadius: 'var(--radius)',
        padding: 10, flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          {value ?? '—'}
        </p>
        {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </Card>
  );
}

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    sellerService.getMyReport()
      .then(r => setData(r.data))
      .catch(() => setError(
        'No se pudo cargar el dashboard. Verifica que tu cuenta de vendedor esté aprobada.'
      ))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner size={36} /></div>;

  if (error) return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi Dashboard</h1>
      <Card style={{ padding: 40, textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </Card>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <BarChart2 size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Mi Reporte
          </h1>
          <p className={styles.sub}>
            {data?.storeName || 'Mi Tienda'} — resumen de rendimiento
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <StatCard icon={DollarSign} label="Ingresos totales"
          value={`$${data?.totalRevenue?.toFixed(2) ?? '0.00'}`}
          color="#059669" />
        <StatCard icon={ShoppingBag} label="Órdenes recibidas"
          value={data?.totalOrders ?? 0} color="var(--b300)" />
        <StatCard icon={Package} label="Productos activos"
          value={data?.activeProducts ?? 0}
          sub={`${data?.totalProductsSold ?? 0} vendidos en total`}
          color="#8b5cf6" />
        <StatCard icon={Star} label="Calificación promedio"
          value={data?.averageRating?.toFixed(1) ?? '—'}
          sub={`${data?.totalReviews ?? 0} reseñas`}
          color="#f59e0b" />
        <StatCard icon={Eye} label="Vistas de productos"
          value={data?.totalViews?.toLocaleString() ?? 0}
          color="#6366f1" />
        <StatCard icon={TrendingUp} label="Productos vendidos"
          value={data?.totalProductsSold ?? 0}
          color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top productos */}
        {data?.topProducts?.length > 0 && (
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
              <TrendingUp size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Productos más vendidos
            </h3>
            {data.topProducts.map((p, i) => (
              <div key={p.productId ?? i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>
                  #{i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{p.productTitle}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.totalSold} vendidos · ${p.revenue?.toFixed(2) ?? '0.00'} ingresos
                  </p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ★ {p.averageRating?.toFixed(1) ?? '—'}
                </span>
              </div>
            ))}
          </Card>
        )}

        {/* Órdenes recientes */}
        {data?.recentOrders?.length > 0 && (
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
              <ShoppingBag size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Órdenes recientes
            </h3>
            {data.recentOrders.map((o, i) => (
              <div key={o.orderId ?? i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>#{o.orderNumber}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {o.buyerName} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString('es') : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge color={STATUS_COLOR[o.status] ?? 'gray'} style={{ fontSize: 10 }}>
                    {o.status}
                  </Badge>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--b300)' }}>
                    ${o.total?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        )}

        {(!data?.topProducts?.length && !data?.recentOrders?.length) && (
          <Card style={{ padding: 40, textAlign: 'center', gridColumn: '1/-1' }}>
            <Package size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)' }}>
              Aún no tienes actividad. ¡Publica tu primer producto!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
