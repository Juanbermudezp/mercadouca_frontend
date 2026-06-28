import { useState, useEffect, useCallback } from 'react';
import {
  Users, Clock, CheckCircle, XCircle,
  AlertTriangle, UserCheck, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin/adminService';
import { Card, Badge, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import styles from './AdminPage.module.css';

// ── Constantes ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'users',     label: 'Usuarios',    icon: Users },
  { key: 'sellers',   label: 'Vendedores',  icon: UserCheck },
  { key: 'pending',   label: 'Pendientes',  icon: Clock },
  { key: 'suspended', label: 'Suspendidos', icon: AlertTriangle },
];

const SELLER_STATUS_COLOR = {
  PENDING: 'orange', VERIFIED: 'green', REJECTED: 'red',
  SUSPENDED: 'purple', BLOCKED: 'gray',
};

const ROLE_COLOR = { ADMIN: 'purple', SELLER: 'blue', BUYER: 'green' };

// ── Sub-componentes ───────────────────────────────────────────────────────────

function UserRow({ u, onToggle }) {
  return (
    <Card className={styles.card}>
      <div className={styles.cardInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <p className={styles.name}>{u.firstName} {u.lastName}</p>
          <Badge color={ROLE_COLOR[u.role] || 'gray'}>{u.role}</Badge>
          {!u.enabled && <Badge color="red">Inactivo</Badge>}
          {!u.accountNonLocked && <Badge color="gray">Bloqueado</Badge>}
        </div>
        <p className={styles.sub}>@{u.username} · {u.email}</p>
        <p className={styles.sub}>
          Registrado: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es') : '—'}
        </p>
      </div>
      <Button size="sm" variant={u.enabled ? 'danger' : 'outline'}
        onClick={() => onToggle(u.id, u.enabled)}>
        {u.enabled ? 'Desactivar' : 'Desbloquear'}
      </Button>
    </Card>
  );
}

function SellerRow({ s, onAction }) {
  return (
    <Card className={styles.card}>
      <div className={styles.cardInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <p className={styles.name}>{s.storeName}</p>
          <Badge color={SELLER_STATUS_COLOR[s.status] || 'gray'}>{s.status}</Badge>
        </div>
        <p className={styles.sub}>{s.email} · {s.firstName} {s.lastName}</p>
        {s.taxId && <p className={styles.sub}>NIT: {s.taxId}</p>}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: 6, marginTop: 8,
        }}>
          {[
            { l: 'Ingresos', v: `$${s.totalRevenue?.toFixed(2) ?? '0.00'}` },
            { l: 'Órdenes',  v: s.totalOrders ?? 0 },
            { l: 'Productos',v: s.activeProducts ?? 0 },
            { l: 'Rating',   v: s.averageRating?.toFixed(1) ?? '—' },
          ].map(m => (
            <div key={m.l} style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
              padding: '6px 8px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.l}</p>
              <p style={{ fontSize: 13, fontWeight: 700 }}>{m.v}</p>
            </div>
          ))}
        </div>
        {s.rejectionReason && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Motivo: {s.rejectionReason}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
        {s.status === 'PENDING' && <>
          <Button size="sm" onClick={() => onAction('approve', s.userId)}>Aprobar</Button>
          <Button size="sm" variant="danger" onClick={() => onAction('reject', s.userId)}>Rechazar</Button>
        </>}
        {s.status === 'VERIFIED' && <>
          <Button size="sm" variant="outline" onClick={() => onAction('warn', s.userId)}>
            <AlertTriangle size={12} style={{ marginRight: 4 }} />Advertir
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAction('suspend', s.userId)}>
            Suspender
          </Button>
        </>}
        {(s.status === 'SUSPENDED' || s.status === 'REJECTED') && (
          <Button size="sm" onClick={() => onAction('approve', s.userId)}>Reactivar</Button>
        )}
        {s.status === 'BLOCKED' && (
          <Button size="sm" variant="outline" onClick={() => onAction('unblock', s.userId)}>Desbloquear</Button>
        )}
      </div>
    </Card>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminUserManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let content = [];
      if (activeTab === 'users') {
        const r = await adminService.getAllUsers({ page: 0, size: 50 });
        content = r.data?.content || [];
      } else if (activeTab === 'pending') {
        const r = await adminService.getPendingSellers({ page: 0, size: 50 });
        content = r.data?.content || [];
      } else {
        const r = await adminService.getAllSellers({ page: 0, size: 50 });
        let all = r.data?.content || [];
        if (activeTab === 'sellers') all = all.filter(s => s.status !== 'PENDING');
        if (activeTab === 'suspended') all = all.filter(s => s.status === 'SUSPENDED');
        content = all;
      }
      setItems(content);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const filtered = query
    ? items.filter(i => {
        const s = `${i.firstName} ${i.lastName} ${i.email} ${i.storeName || ''} ${i.username || ''}`.toLowerCase();
        return s.includes(query.toLowerCase());
      })
    : items;

  const handleAction = async (action, userId) => {
    try {
      if (action === 'approve')  { await adminService.approveSeller(userId); toast.success('Aprobado'); }
      else if (action === 'reject') {
        const r = window.prompt('Motivo de rechazo:');
        if (!r) return;
        await adminService.rejectSeller(userId, r); toast.success('Rechazado');
      } else if (action === 'warn') {
        const r = window.prompt('Motivo de la advertencia:');
        if (!r) return;
        await adminService.warnSeller(userId, r); toast.success('Advertencia enviada');
      } else if (action === 'suspend') {
        const r = window.prompt('Motivo de suspensión:');
        if (!r) return;
        await adminService.suspendSeller(userId, r); toast.success('Suspendido');
      } else if (action === 'block') {
        const r = window.prompt('Motivo de bloqueo permanente:');
        if (!r) return;
        await adminService.blockSeller(userId, r); toast.success('Bloqueado');
      } else if (action === 'unblock') {
        await adminService.unblockSeller(userId); toast.success('Vendedor desbloqueado');
      } else if (action === 'toggle') {
        await adminService.toggleUserStatus(userId); toast.success('Estado cambiado');
      }
      load();
    } catch (e) { toast.error(e?.message || 'Error al ejecutar la acción'); }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Gestión de Usuarios</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid',
              borderColor: activeTab === key ? 'var(--b300)' : 'var(--border)',
              background: activeTab === key ? 'var(--b300)' : 'var(--card-bg)',
              color: activeTab === key ? '#fff' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <form onSubmit={e => { e.preventDefault(); setQuery(search); }}
        style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', left: 11, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o tienda..."
            style={{
              width: '100%', padding: '9px 14px 9px 32px',
              background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }} />
        </div>
        <Button type="submit" size="sm" icon={<Search size={13} />}>Buscar</Button>
        {query && <Button size="sm" variant="ghost" onClick={() => { setQuery(''); setSearch(''); }}>Limpiar</Button>}
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
          Sin resultados en esta categoría
        </p>
      ) : (
        <div className={styles.list}>
          {activeTab === 'users'
            ? filtered.map(u => (
                <UserRow key={u.id} u={u} onToggle={(id, en) => handleAction('toggle', id)} />
              ))
            : filtered.map(s => (
                <SellerRow key={s.userId} s={s} onAction={handleAction} />
              ))
          }
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 8 }}>
        {filtered.length} resultado(s)
      </p>
    </div>
  );
}
