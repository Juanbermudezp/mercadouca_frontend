import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin/adminService';
import { Card, Badge, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import styles from './AdminPage.module.css';

const STATUS_COLOR = {
  PENDING: 'orange', VERIFIED: 'green', REJECTED: 'red',
  SUSPENDED: 'purple', BLOCKED: 'gray',
};
const STATUS_LABEL = {
  PENDING: 'Pendiente', VERIFIED: 'Aprobado', REJECTED: 'Rechazado',
  SUSPENDED: 'Suspendido', BLOCKED: 'Bloqueado',
};

const TABS = [
  { key: 'all',      label: 'Todos',      icon: Users },
  { key: 'PENDING',  label: 'Pendientes', icon: Clock },
  { key: 'VERIFIED', label: 'Aprobados',  icon: CheckCircle },
  { key: 'SUSPENDED',label: 'Suspendidos',icon: AlertTriangle },
  { key: 'BLOCKED',  label: 'Bloqueados', icon: Ban },
];

function SellerCard({ s, onAction }) {
  return (
    <Card className={styles.card}>
      <div className={styles.cardInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <p className={styles.name}>{s.storeName}</p>
          <Badge color={STATUS_COLOR[s.status] || 'gray'}>{STATUS_LABEL[s.status] || s.status}</Badge>
        </div>
        <p className={styles.sub}>{s.email} — {s.firstName} {s.lastName}</p>
        {s.taxId && <p className={styles.sub}>NIT: {s.taxId}</p>}

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8, marginTop: 10,
        }}>
          {[
            { label: 'Ingresos', value: `$${s.totalRevenue?.toFixed(2) ?? '0.00'}` },
            { label: 'Órdenes',  value: s.totalOrders ?? 0 },
            { label: 'Productos',value: s.activeProducts ?? 0 },
            { label: 'Rating',   value: s.averageRating?.toFixed(1) ?? '—' },
          ].map(m => (
            <div key={m.label} style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
              padding: '8px 10px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</p>
            </div>
          ))}
        </div>

        {s.rejectionReason && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            <strong>Motivo:</strong> {s.rejectionReason}
          </p>
        )}
      </div>

      <div className={styles.cardActions} style={{ flexDirection: 'column', gap: 6, minWidth: 130 }}>
        {s.status === 'PENDING' && <>
          <Button size="sm" onClick={() => onAction('approve', s.userId)}>Aprobar</Button>
          <Button size="sm" variant="danger" onClick={() => onAction('reject', s.userId)}>Rechazar</Button>
        </>}
        {s.status === 'VERIFIED' && <>
          <Button size="sm" variant="outline" onClick={() => onAction('suspend', s.userId)}>
            <AlertTriangle size={12} style={{ marginRight: 4 }} />Suspender
          </Button>
          <Button size="sm" variant="danger" onClick={() => onAction('block', s.userId)}>
            <Ban size={12} style={{ marginRight: 4 }} />Bloquear
          </Button>
        </>}
        {s.status === 'SUSPENDED' && (
          <Button size="sm" onClick={() => onAction('approve', s.userId)}>Reactivar</Button>
        )}
      </div>
    </Card>
  );
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'all'
        ? await adminService.getAllSellers({ page: 0, size: 50 })
        : activeTab === 'PENDING'
          ? await adminService.getPendingSellers({ page: 0, size: 50 })
          : await adminService.getAllSellers({ page: 0, size: 50 });

      let content = res.data?.content || [];
      if (activeTab !== 'all' && activeTab !== 'PENDING') {
        content = content.filter(s => s.status === activeTab);
      }
      setSellers(content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab]);

  const handleAction = async (action, userId) => {
    try {
      if (action === 'approve') {
        await adminService.approveSeller(userId);
        toast.success('Vendedor aprobado / reactivado');
      } else if (action === 'reject') {
        const reason = window.prompt('Motivo de rechazo:');
        if (!reason) return;
        await adminService.rejectSeller(userId, reason);
        toast.success('Vendedor rechazado');
      } else if (action === 'suspend') {
        const reason = window.prompt('Motivo de suspensión:');
        if (!reason) return;
        await adminService.suspendSeller(userId, reason);
        toast.success('Vendedor suspendido');
      } else if (action === 'block') {
        const reason = window.prompt('Motivo de bloqueo permanente:');
        if (!reason) return;
        await adminService.blockSeller(userId, reason);
        toast.success('Vendedor bloqueado');
      }
      load();
    } catch (e) {
      toast.error(e?.message || 'Error al ejecutar la acción');
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Panel de Vendedores</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid',
              borderColor: activeTab === key ? 'var(--b300)' : 'var(--border)',
              background: activeTab === key ? 'var(--b300)' : 'var(--card-bg)',
              color: activeTab === key ? '#fff' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
            }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spinner />
        </div>
      ) : sellers.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
          No hay vendedores en esta categoría
        </p>
      ) : (
        <div className={styles.list}>
          {sellers.map(s => (
            <SellerCard key={s.userId} s={s} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}
