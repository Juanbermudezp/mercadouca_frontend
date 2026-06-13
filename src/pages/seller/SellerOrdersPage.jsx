import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Truck, CheckCircle, Send } from 'lucide-react';
import { orderService } from '../../services/orders/orderService';
import { Card, Badge, Spinner, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import { ORDER_STATUS } from '../../constants';
import styles from './SellerPage.module.css';

const STATUS_BADGE = { PENDING:'orange', PAID:'blue', SHIPPED:'purple', DELIVERED:'green', CANCELLED:'red' };

function ShipPanel({ orderId, onDone, onCancel }) {
  const [tracking, setTracking] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await orderService.updateStatus(orderId, { status: 'SHIPPED', trackingNumber: tracking.trim() });
      toast.success('Orden marcada como enviada'); onDone();
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ marginTop:10, display:'flex', gap:8, alignItems:'center' }}>
      <input value={tracking} onChange={e => setTracking(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Numero de tracking..." autoFocus
        style={{ flex:1, padding:'8px 12px', background:'var(--bg-secondary)',
          border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
          color:'var(--text-primary)', fontSize:13, outline:'none' }}/>
      <Button size="sm" icon={<Send size={12}/>} onClick={submit} loading={saving}>Confirmar</Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
    </div>
  );
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [shippingId, setShippingId] = useState(null);

  const load = () => {
    setLoading(true);
    orderService.getSellerOrders({ page, size: 15 })
      .then(r => { setOrders(r.data?.content || []); setTotalPages(r.data?.totalPages || 0); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page]);

  const deliver = async (id) => {
    try { await orderService.updateStatus(id, { status: 'DELIVERED' }); toast.success('Orden entregada'); load(); }
    catch (e) { toast.error(e?.message || 'Error'); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Ordenes Recibidas</h1><p className={styles.sub}>{orders.length} ordenes</p></div>
      </div>
      {loading ? <div className={styles.center}><Spinner size={36}/></div>
        : orders.length === 0 ? <Empty icon="package" title="Sin ordenes" subtitle="Aun no has recibido ordenes"/>
        : (
          <>
            <div className={styles.list}>
              {orders.map(order => {
                const st = ORDER_STATUS[order.status] || {};
                return (
                  <Card key={order.id} className={styles.row} style={{ flexDirection:'column', alignItems:'stretch' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className={styles.rowTitleRow}>
                          <p className={styles.rowTitle}>#{order.orderNumber}</p>
                          <Badge color={STATUS_BADGE[order.status] || 'gray'}>{st.label || order.status}</Badge>
                        </div>
                        <p className={styles.rowSub}>{order.buyerName} - {new Date(order.createdAt).toLocaleDateString('es')} - {order.items?.length} items</p>
                        {order.trackingNumber && <p className={styles.rowSub} style={{ color:'var(--b300)', marginTop:2 }}>Tracking: {order.trackingNumber}</p>}
                      </div>
                      <p className={styles.rowPrice}>${order.total?.toFixed(2)}</p>
                      <div className={styles.rowActions}>
                        {order.status === 'PAID' && shippingId !== order.id && (
                          <Button size="sm" icon={<Truck size={13}/>} onClick={() => setShippingId(order.id)}>Enviar</Button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <Button size="sm" variant="outline" icon={<CheckCircle size={13}/>} onClick={() => deliver(order.id)}>Entregado</Button>
                        )}
                      </div>
                    </div>
                    {shippingId === order.id && <ShipPanel orderId={order.id} onDone={() => { setShippingId(null); load(); }} onCancel={() => setShippingId(null)}/>}
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    style={{ width:34, height:34, borderRadius:'var(--radius-sm)', border:'1.5px solid',
                      fontSize:13, fontWeight:500, transition:'all .2s', cursor:'pointer',
                      borderColor: i===page ? 'var(--b300)' : 'var(--border)',
                      background: i===page ? 'var(--b300)' : 'var(--card-bg)',
                      color: i===page ? '#fff' : 'var(--text-secondary)' }}>{i+1}</button>
                ))}
              </div>
            )}
          </>
        )
      }
    </div>
  );
}
