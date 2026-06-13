import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { adminService } from '../../services/admin/adminService';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import { ORDER_STATUS } from '../../constants';
import styles from '../orders/OrdersPage.module.css';

const STATUS_COLOR = {
  PENDING: 'orange', PAID: 'blue', SHIPPED: 'purple',
  DELIVERED: 'green', CANCELLED: 'red',
};

function OrderRow({ order, adminId }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const openChat = async (withUserId, withName = '') => {
    try {
      // Construir conversationId directamente (misma lógica que el backend)
      const a = Math.min(adminId, withUserId);
      const b = Math.max(adminId, withUserId);
      const convId = `conv_${a}_${b}`;
      navigate(`/chat?conversation=${convId}&withUser=${withUserId}&withName=${encodeURIComponent(withName)}`);
    } catch {
      navigate('/chat');
    }
  };

  const st = ORDER_STATUS?.[order.status] || {};

  return (
    <Card className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div>
          <p className={styles.orderNum}>#{order.orderNumber}</p>
          <p className={styles.orderDate}>
            {order.buyerName} · {new Date(order.createdAt).toLocaleDateString('es')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge color={STATUS_COLOR[order.status] || 'gray'}>
            {st.label || order.status}
          </Badge>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--b300)' }}>
            ${order.total?.toFixed(2)}
          </span>
          <button onClick={() => setExpanded(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {/* Items de la orden */}
          {order.items?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: 'var(--text-secondary)', padding: '3px 0',
                }}>
                  <span>{item.productTitle} ×{item.quantity}</span>
                  <span>${item.subtotal?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Dirección de envío */}
          {order.shippingAddress && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              📦 {order.shippingAddress}, {order.shippingCity}, {order.shippingCountry}
            </p>
          )}

          {/* Botones de chat */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {order.buyerId && (
              <Button
                size="sm"
                variant="outline"
                icon={<MessageCircle size={14} />}
                onClick={() => openChat(order.buyerId, order.buyerName || 'Comprador')}
              >
                Chat con Comprador
              </Button>
            )}
            {order.items?.map((item, i) =>
              item.sellerId ? (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  icon={<MessageCircle size={14} />}
                  onClick={() => openChat(item.sellerId, item.sellerName || 'Vendedor')}
                >
                  Chat con {item.sellerName || 'Vendedor'}
                </Button>
              ) : null
            ).filter(Boolean).filter((el, i, arr) =>
              // Deduplicar si hay múltiples items del mismo vendedor
              arr.findIndex(e => e?.key === el?.key) === i
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const adminId = user?.userId || user?.id;
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, size: 15 };
      const res = statusFilter
        ? await adminService.getOrdersByStatus(statusFilter, params)
        : await adminService.getAllOrders(params);
      const data = res.data || res;
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const STATUS_OPTIONS = ['', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Gestión de Órdenes</h1>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          style={{
            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
          }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s ? (ORDER_STATUS[s]?.label || s) : 'Todos los estados'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          No hay órdenes{statusFilter ? ` con estado "${ORDER_STATUS[statusFilter]?.label || statusFilter}"` : ''}.
        </p>
      ) : (
        <>
          {orders.map(order => (
            <OrderRow key={order.id} order={order} adminId={adminId} />
          ))}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                ← Anterior
              </Button>
              <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                {page + 1} / {totalPages}
              </span>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
