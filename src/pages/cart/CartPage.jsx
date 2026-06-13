import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { Card, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart, loading } = useCart();
  const navigate = useNavigate();

  if (!cart?.items?.length) return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi Carrito</h1>
      <Empty icon={<ShoppingBag size={48}/>} title="Tu carrito está vacío" subtitle="Agrega productos para comenzar tu compra"
        action={<Button onClick={() => navigate('/shop')}>Ir a la Tienda</Button>} />
    </div>
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi Carrito <span className={styles.count}>({cart.itemCount})</span></h1>
      <div className={styles.layout}>
        <div className={styles.items}>
          {cart.items.map(item => (
            <Card key={item.id} className={styles.item}>
              <img src={item.productImage || `https://placehold.co/80x80/e6f0ff/0065ff?text=P`} alt={item.productTitle} className={styles.itemImg}/>
              <div className={styles.itemInfo}>
                <Link to={`/products/${item.productId}`} className={styles.itemTitle}>{item.productTitle}</Link>
                <p className={styles.itemSeller}>{item.sellerName}</p>
                <p className={styles.itemPrice}>${item.unitPrice?.toFixed(2)}</p>
              </div>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn} onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}><Minus size={13}/></button>
                <span className={styles.qtyVal}>{item.quantity}</span>
                <button className={styles.qtyBtn} onClick={() => updateItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.availableStock}><Plus size={13}/></button>
              </div>
              <p className={styles.subtotal}>${item.subtotal?.toFixed(2)}</p>
              <button className={styles.removeBtn} onClick={() => removeItem(item.id)}><Trash2 size={16}/></button>
            </Card>
          ))}
          <button className={styles.clearBtn} onClick={() => { clearCart(); toast.success('Carrito vaciado'); }}>Vaciar carrito</button>
        </div>
        <Card className={styles.summary}>
          <h3 className={styles.summaryTitle}>Resumen del Pedido</h3>
          <div className={styles.summaryRow}><span>Subtotal ({cart.itemCount} items)</span><span>${cart.total?.toFixed(2)}</span></div>
          <div className={styles.summaryRow}><span>Envío</span><span className={styles.calcText}>Se calcula al pagar</span></div>
          <div className={`${styles.summaryRow} ${styles.total}`}><span>Total</span><span>${cart.total?.toFixed(2)}</span></div>
          <Button fullWidth size="lg" onClick={() => navigate('/checkout')}>Proceder al Pago</Button>
          <Button fullWidth variant="ghost" onClick={() => navigate('/shop')}>Seguir Comprando</Button>
        </Card>
      </div>
    </div>
  );
}
