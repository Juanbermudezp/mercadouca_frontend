import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orders/orderService';
import { shippingService } from '../../services/shipping/shippingService';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Spinner, Stars } from '../../components/common/UI';
import Button from '../../components/common/Button';
import { ORDER_STATUS } from '../../constants';
import styles from './OrderDetailPage.module.css';

const STATUS_BADGE = { PENDING:'orange', PAID:'blue', SHIPPED:'purple', DELIVERED:'green', CANCELLED:'red' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isBuyer } = useAuth();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(id, user?.userId || user?.id)
      .then(r => {
        setOrder(r.data);
        if (r.data.trackingNumber && r.data.shippingProvider) {
          shippingService.track(r.data.shippingProvider, r.data.trackingNumber)
            .then(t => setTracking(t.data)).catch(() => {});
        }
      }).finally(() => setLoading(false));
  }, [id]);

  const cancel = async () => {
    if (!confirm('¿Cancelar esta orden?')) return;
    try {
      await orderService.cancel(id);
      toast.success('Orden cancelada');
      navigate('/orders');
    } catch (e) { toast.error(e?.message || 'No se puede cancelar'); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={40}/></div>;
  if (!order) return <p style={{ color:'var(--text-muted)', padding:40 }}>Orden no encontrada</p>;

  const st = ORDER_STATUS[order.status] || {};

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}><ArrowLeft size={18}/> Volver</button>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Orden #{order.orderNumber}</h1>
            <p className={styles.date}>{new Date(order.createdAt).toLocaleString('es')}</p>
          </div>
          <Badge color={STATUS_BADGE[order.status]||'gray'} size="md">{st.label||order.status}</Badge>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.left}>
          <Card className={styles.card}>
            <h3 className={styles.sectionTitle}><Package size={16}/> Productos</h3>
            {order.items?.map(item => (
              <div key={item.id} className={styles.item}>
                <img src={item.productImage||`https://placehold.co/60x60/e6f0ff/0065ff?text=P`} alt={item.productTitle} className={styles.itemImg}/>
                <div className={styles.itemInfo}>
                  <p className={styles.itemTitle}>{item.productTitle}</p>
                  <p className={styles.itemSub}>{item.sellerName} • x{item.quantity}</p>
                </div>
                <p className={styles.itemPrice}>${item.subtotal?.toFixed(2)}</p>
              </div>
            ))}
          </Card>

          {tracking && (
            <Card className={styles.card}>
              <h3 className={styles.sectionTitle}><Truck size={16}/> Seguimiento</h3>
              <div className={styles.tracking}>
                <div className={styles.trackRow}><span>Tracking:</span><strong>{order.trackingNumber}</strong></div>
                <div className={styles.trackRow}><span>Estado:</span><strong>{tracking.status}</strong></div>
                <div className={styles.trackRow}><span>Ubicación:</span><strong>{tracking.location}</strong></div>
                <div className={styles.trackRow}><span>Entrega estimada:</span><strong>{tracking.estimatedDelivery}</strong></div>
              </div>
            </Card>
          )}
        </div>

        <div className={styles.right}>
          <Card className={styles.card}>
            <h3 className={styles.sectionTitle}>Resumen</h3>
            <div className={styles.summaryRow}><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
            {order.discountAmount > 0 && <div className={styles.summaryRow} style={{ color:'var(--success)' }}><span>Descuento {order.couponCode && `(${order.couponCode})`}</span><span>-${order.discountAmount?.toFixed(2)}</span></div>}
            <div className={styles.summaryRow}><span>Envío ({order.shippingProvider})</span><span>${order.shippingCost?.toFixed(2)}</span></div>
            <div className={`${styles.summaryRow} ${styles.total}`}><span>Total</span><span>${order.total?.toFixed(2)}</span></div>
            <div className={styles.summaryRow}><span>Método de pago</span><span>{order.paymentMethod}</span></div>
          </Card>

          <Card className={styles.card}>
            <h3 className={styles.sectionTitle}>Dirección de envío</h3>
            <p className={styles.addr}>{order.shippingAddress}</p>
            <p className={styles.addr}>{order.shippingCity}, {order.shippingCountry}</p>
          </Card>

          {isBuyer() && ['PENDING','PAID'].includes(order.status) && (
            <Button variant="danger" fullWidth icon={<AlertTriangle size={15}/>} onClick={cancel}>Cancelar orden</Button>
          )}
        </div>
      </div>
    </div>
  );
}
