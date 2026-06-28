import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
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
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, size: 15 };
      let res;
      if (searchQuery) {
        res = await adminService.searchOrders(searchQuery, params);
      } else if (statusFilter) {
        res = await adminService.getOrdersByStatus(statusFilter, params);
      } else {
        res = await adminService.getAllOrders(params);
      }
      const data = res.data || res;
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setStatusFilter('');
    setSearchQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(0);
  };

  const STATUS_OPTIONS = ['', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Gestión de Órdenes</h1>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setSearchQuery(''); setSearchInput(''); setPage(0); }}
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

      {/* Barra de búsqueda */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', left: 11, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar por número de orden o nombre del comprador..."
            style={{
              width: '100%', padding: '9px 36px 9px 32px',
              background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
          {searchInput && (
            <button type="button" onClick={clearSearch} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
            }}>
              <X size={14} />
            </button>
          )}
        </div>
        <Button type="submit" size="sm" icon={<Search size={13} />}>Buscar</Button>
        {searchQuery && (
          <Button type="button" size="sm" variant="ghost" onClick={clearSearch}>Limpiar</Button>
        )}
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          {searchQuery
            ? `No se encontraron órdenes para "${searchQuery}".`
            : statusFilter
              ? `No hay órdenes con estado "${ORDER_STATUS[statusFilter]?.label || statusFilter}".`
              : 'No hay órdenes.'}
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
