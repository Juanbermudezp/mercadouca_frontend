import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Stars, Badge } from '../common/UI';
import { useCart } from '../../context/CartContext';
import { wishlistService } from '../../services/wishlist/wishlistService';
import { useAuth } from '../../context/AuthContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart() || {};
  const { user, canBuy } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!canBuy()) { toast.error('Debes iniciar sesión para comprar'); return; }
    setAdding(true);
    try {
      await addItem(product.id, 1);
      toast.success('Agregado al carrito');
    } catch (err) { toast.error(err?.message || 'Error al agregar'); }
    finally { setAdding(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Inicia sesión para guardar'); return; }
    try {
      if (wishlisted) { await wishlistService.remove(product.id); setWishlisted(false); }
      else { await wishlistService.add(product.id); setWishlisted(true); toast.success('Guardado en favoritos'); }
    } catch { toast.error('Error'); }
  };

  const img = product.images?.[0] || `https://placehold.co/280x200/e6f0ff/0065ff?text=${encodeURIComponent(product.title?.slice(0,15)||'Producto')}`;
  const discounted = product.originalPrice && product.originalPrice > product.price;

  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={img} alt={product.title} className={styles.img} loading="lazy" />
        {product.featured && <Badge color="blue" size="sm" className={styles.featBadge}>Destacado</Badge>}
        <button className={`${styles.wishBtn} ${wishlisted ? styles.wished : ''}`} onClick={handleWishlist}>
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className={styles.body}>
        <p className={styles.category}>{product.categoryName}</p>
        <h3 className={styles.title}>{product.title}</h3>
        <div className={styles.rating}>
          <Stars rating={product.averageRating} />
          <span className={styles.ratingCount}>({product.totalReviews})</span>
        </div>
        <p className={styles.availability}>Disponibles ({product.stock})</p>
        <div className={styles.priceRow}>
          <span className={styles.price}>${product.price?.toFixed(2)}</span>
          {discounted && <span className={styles.original}>${product.originalPrice?.toFixed(2)}</span>}
        </div>
        <button className={styles.cartBtn} onClick={handleAddToCart} disabled={adding}>
          <ShoppingCart size={14} />
          {adding ? 'Agregando...' : 'Agregar al Carrito'}
        </button>
      </div>
    </Link>
  );
}
