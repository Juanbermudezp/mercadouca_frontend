import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign, Clock, TrendingUp, Eye } from 'lucide-react';
import { adminService } from '../../services/admin/adminService';
import { Card, Spinner, SkeletonCard } from '../../components/common/UI';
import styles from './DashboardPage.module.css';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <Card className={styles.stat}>
      <div className={styles.statIcon} style={{ background: color + '18', color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value ?? '—'}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><Spinner size={40}/></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Vista general de la plataforma Mercaduca</p>
      </div>
      <div className={styles.statsGrid}>
        <StatCard icon={Users} label="Usuarios" value={data?.totalUsers?.toLocaleString()} color="var(--b300)" />
        <StatCard icon={Users} label="Vendedores" value={data?.totalSellers?.toLocaleString()} color="#8b5cf6" />
        <StatCard icon={Package} label="Productos" value={data?.totalProducts?.toLocaleString()} color="#10b981" />
        <StatCard icon={ShoppingBag} label="Órdenes" value={data?.totalOrders?.toLocaleString()} color="#f59e0b" />
        <StatCard icon={Clock} label="Pendientes" value={data?.pendingOrders?.toLocaleString()} color="#ef4444" />
        <StatCard icon={DollarSign} label="Ingresos" value={`$${data?.totalRevenue?.toFixed(2) || '0.00'}`} color="#059669" />
      </div>
      <div className={styles.tables}>
        <Card className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}><TrendingUp size={18}/> Top Más Vendidos</h3>
          </div>
          <div className={styles.tableList}>
            {(data?.topSellingProducts || []).map((p, i) => (
              <div key={p.productId} className={styles.tableRow}>
                <span className={styles.rank}>#{i+1}</span>
                <div className={styles.rowInfo}>
                  <p className={styles.rowTitle}>{p.productTitle}</p>
                  <p className={styles.rowSub}>{p.sellerName}</p>
                </div>
                <span className={styles.rowBadge}>{p.totalSold} vendidos</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}><Eye size={18}/> Top Más Vistos</h3>
          </div>
          <div className={styles.tableList}>
            {(data?.topViewedProducts || []).map((p, i) => (
              <div key={p.productId} className={styles.tableRow}>
                <span className={styles.rank}>#{i+1}</span>
                <div className={styles.rowInfo}>
                  <p className={styles.rowTitle}>{p.productTitle}</p>
                </div>
                <span className={styles.rowBadge}>{p.totalViews?.toLocaleString()} vistas</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
