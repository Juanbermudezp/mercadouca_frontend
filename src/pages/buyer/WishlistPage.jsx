import { useState, useEffect } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistService } from '../../services/wishlist/wishlistService';
import { useCart } from '../../context/CartContext';
import { Card, Spinner, Empty, Stars, Badge } from '../../components/common/UI';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import styles from './BuyerPage.module.css';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart() || {};

  const load = () => wishlistService.getAll({ page:0, size:40 }).then(r => setItems(r.data?.content || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (productId) => {
    await wishlistService.remove(productId);
    setItems(prev => prev.filter(i => i.productId !== productId));
    toast.success('Eliminado de favoritos');
  };

  const addToCart = async (item) => {
    try { await addItem(item.productId, 1); toast.success('Agregado al carrito'); }
    catch (e) { toast.error(e?.message || 'Error'); }
  };

  if (loading) return <div className={styles.center}><Spinner size={36}/></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>❤️ Lista de Deseos <span className={styles.count}>({items.length})</span></h1>

      {items.length === 0 ? (
        <Empty icon={<Heart size={48}/>} title="Tu lista de deseos está vacía"
          subtitle="Guarda productos que te interesen para comprarlos después"
          action={<Link to="/shop"><Button>Explorar productos</Button></Link>}/>
      ) : (
        <div className={styles.grid}>
          {items.map(item => (
            <Card key={item.id} className={styles.wishCard} hover>
              <Link to={`/products/${item.productId}`}>
                <div className={styles.wishImgWrap}>
                  <img src={item.productImage || `https://placehold.co/260x200/e6f0ff/0065ff?text=P`} alt={item.productTitle} className={styles.wishImg}/>
                  {item.status !== 'ACTIVE' && <div className={styles.unavailableOverlay}>No disponible</div>}
                </div>
              </Link>
              <div className={styles.wishBody}>
                <Link to={`/products/${item.productId}`} className={styles.wishTitle}>{item.productTitle}</Link>
                <Stars rating={item.averageRating} />
                <p className={styles.wishPrice}>${item.price?.toFixed(2)}</p>
                <p className={styles.wishDate}>Agregado: {new Date(item.addedAt).toLocaleDateString('es')}</p>
                <div className={styles.wishActions}>
                  <Button size="sm" icon={<ShoppingCart size={13}/>} fullWidth onClick={() => addToCart(item)} disabled={item.status !== 'ACTIVE'}>
                    Al carrito
                  </Button>
                  <button className={styles.removeBtn} onClick={() => remove(item.productId)} title="Quitar de favoritos">
                    <Heart size={16} fill="currentColor"/>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
