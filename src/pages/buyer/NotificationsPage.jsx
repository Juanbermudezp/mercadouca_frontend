import { useState, useEffect } from 'react';
import { BellOff } from 'lucide-react';
import { notificationService } from '../../services/notifications/notificationService';
import { useAuth } from '../../context/AuthContext';
import { Card, Spinner, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import styles from './BuyerPage.module.css';

const ICONS = {
  PURCHASE_CONFIRMED: '🛍️', ORDER_SHIPPED: '📦', ORDER_DELIVERED: '🎉',
  ORDER_CANCELLED: '❌', ORDER_REFUNDED: '💰', SHIPMENT_UPDATE: '🚚',
  PRICE_REDUCED: '💸', SELLER_APPROVED: '✅', SELLER_REJECTED: '❌',
  SELLER_SUSPENDED: '⚠️', SELLER_BLOCKED: '🚫', SELLER_WARNING: '⚠️',
  NEW_MESSAGE: '💬', NEW_QUESTION: '❓', NEW_ANSWER: '💡',
  DISPUTE_RESOLVED: '✅', NEW_DISPUTE: '⚠️', NEW_ORDER: '🛒',
  REVIEW_RECEIVED: '⭐',
};

/** Eventos que cambian el rol/estado del usuario → refrescar sesión */
const SESSION_REFRESH_TYPES = new Set([
  'SELLER_APPROVED', 'SELLER_REJECTED', 'SELLER_SUSPENDED', 'SELLER_BLOCKED',
]);

export default function NotificationsPage() {
  const { refreshProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]       = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      notificationService.getAll({ page, size: 20 }),
      notificationService.getUnreadCount(),
    ]).then(([res, cnt]) => {
      const items = res.data?.content || [];
      setNotifications(items);
      setTotalPages(res.data?.totalPages || 0);
      setUnread(cnt.data || 0);

      // Si hay notificaciones no leídas que implican cambio de rol → refrescar sesión
      const hasRoleChange = items.some(n => !n.read && SESSION_REFRESH_TYPES.has(n.type));
      if (hasRoleChange) {
        setRefreshing(true);
        refreshProfile()
          .then(() => toast.success('Tu cuenta fue actualizada. Recarga si no ves los cambios.'))
          .finally(() => setRefreshing(false));
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    toast.success('Todas marcadas como leídas');
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return 'ahora';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(date).toLocaleDateString('es');
  };

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className={styles.title}>🔔 Notificaciones</h1>
          {unread > 0 && <p className={styles.sub}>{unread} sin leer</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {refreshing && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Actualizando sesión…</span>}
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.center}><Spinner size={36} /></div>
      ) : notifications.length === 0 ? (
        <Empty icon={<BellOff size={48} />} title="Sin notificaciones"
          subtitle="Cuando haya actividad en tu cuenta aparecerá aquí" />
      ) : (
        <Card className={styles.notifList} style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map(n => (
            <div key={n.id} className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}>
              <div className={styles.notifIcon}>{ICONS[n.type] || '🔔'}</div>
              <div className={styles.notifContent}>
                <p className={styles.notifTitle}>{n.title}</p>
                <p className={styles.notifMsg}>{n.message}</p>
                <p className={styles.notifTime}>{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <div className={styles.unreadDot} />}
            </div>
          ))}
        </Card>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                border: '1.5px solid', fontSize: 13, cursor: 'pointer',
                borderColor: i === page ? 'var(--b300)' : 'var(--border)',
                background: i === page ? 'var(--b300)' : 'var(--card-bg)',
                color: i === page ? '#fff' : 'var(--text-secondary)',
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
