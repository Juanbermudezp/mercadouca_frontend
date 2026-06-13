import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { orderService } from '../../services/orders/orderService';
import { Card, Empty, Spinner, Badge } from '../../components/common/UI';
import { ORDER_STATUS } from '../../constants';
import styles from './OrdersPage.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    orderService.getMyOrders({ page, size: 10 })
      .then(r => { setOrders(r.data?.content || []); setTotalPages(r.data?.totalPages || 0); })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36}/></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mis Órdenes</h1>
      {orders.length === 0 ? (
        <Empty icon={<Package size={48}/>} title="Sin órdenes" subtitle="Aún no has realizado ninguna compra"
          action={<button className={styles.shopBtn} onClick={() => navigate('/shop')}>Ir a comprar</button>} />
      ) : (
        <div className={styles.list}>
          {orders.map(order => {
            const st = ORDER_STATUS[order.status] || {};
            return (
              <Card key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <p className={styles.orderNum}>#{order.orderNumber}</p>
                    <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('es')}</p>
                  </div>
                  <Badge color={order.status === 'DELIVERED' ? 'green' : order.status === 'CANCELLED' ? 'red' : order.status === 'PAID' ? 'blue' : 'orange'}>
                    {st.label || order.status}
                  </Badge>
                </div>
                <div className={styles.orderItems}>
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id} className={styles.orderItem}>
                      <span className={styles.itemDot}/>
                      <span className={styles.itemName}>{item.productTitle}</span>
                      <span className={styles.itemQty}>x{item.quantity}</span>
                      <span className={styles.itemPrice}>${item.subtotal?.toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && <p className={styles.moreItems}>+{order.items.length - 3} más</p>}
                </div>
                <div className={styles.orderFooter}>
                  <span className={styles.total}>Total: <strong>${order.total?.toFixed(2)}</strong></span>
                  <button className={styles.viewBtn} onClick={() => navigate(`/orders/${order.id}`)}>
                    <Eye size={14}/> Ver detalles
                  </button>
                </div>
              </Card>
            );
          })}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`${styles.pageBtn} ${i === page ? styles.active : ''}`} onClick={() => setPage(i)}>{i+1}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
