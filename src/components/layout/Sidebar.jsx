import { NavLink } from 'react-router-dom';
import {
  ShoppingBag, ShoppingCart, MessageCircle, Heart, Bell,
  FileText, BarChart2, Tag, Package, MapPin, AlertCircle,
  LayoutDashboard, Users, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Sidebar.module.css';

/**
 * Navegación base: disponible para BUYER y SELLER (todos los que pueden comprar).
 * SELLER hereda estas rutas porque puede comprar igual que un BUYER.
 */
const baseNav = [
  { to: '/cart',          icon: ShoppingCart, label: 'Carrito', badge: true },
  { to: '/orders',        icon: FileText,     label: 'Mis Compras' },
  { to: '/wishlist',      icon: Heart,        label: 'Favoritos' },
  { to: '/disputes',      icon: AlertCircle,  label: 'Disputas' },
  { to: '/addresses',     icon: MapPin,       label: 'Direcciones' },
  { to: '/chat',          icon: MessageCircle,label: 'Chat' },
  { to: '/notifications', icon: Bell,         label: 'Notificaciones' },
];

/**
 * Sección de vendedor: solo visible si el usuario tiene rol SELLER.
 * Se muestra debajo de la navegación base como extensión de la cuenta.
 */
const sellerSection = [
  { to: '/seller/dashboard', icon: LayoutDashboard, label: 'Mi Reporte' },
  { to: '/seller/products',  icon: Package,          label: 'Productos' },
  { to: '/seller/orders',    icon: FileText,         label: 'Ventas' },
  { to: '/seller/disputes',  icon: AlertCircle,      label: 'Disputas' },
  { to: '/seller/coupons',   icon: Tag,              label: 'Cupones' },
];

/** Navegación exclusiva del administrador */
const adminNav = [
  { to: '/admin/dashboard',  icon: BarChart2,     label: 'Dashboard' },
  { to: '/admin/orders',     icon: FileText,      label: 'Órdenes' },
  { to: '/admin/users',      icon: Users,         label: 'Gestión Usuarios' },
  { to: '/admin/products',   icon: Package,       label: 'Productos' },
  { to: '/admin/disputes',   icon: AlertCircle,   label: 'Disputas' },
  { to: '/admin/categories', icon: Tag,           label: 'Categorías' },
  { to: '/chat',             icon: MessageCircle, label: 'Chat' },
];

function NavItem({ to, icon: Icon, label, badge, cartCount }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      title={label}
    >
      <div className={styles.iconWrap}>
        <Icon size={20} />
        {badge && cartCount > 0 && (
          <span className={styles.badge}>{cartCount}</span>
        )}
      </div>
    </NavLink>
  );
}

export default function Sidebar() {
  const { isAdmin, canSell, canBuy } = useAuth();
  const { cart } = useCart() || {};
  const cartCount = cart?.itemCount || 0;

  if (isAdmin()) {
    return (
      <aside className={styles.sidebar}>
        <NavLink to="/" className={styles.logo}>
          <ShoppingBag size={28} color="var(--b300)" />
        </NavLink>
        <nav className={styles.nav}>
          {adminNav.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <NavLink to="/" className={styles.logo}>
        <ShoppingBag size={28} color="var(--b300)" />
      </NavLink>

      <nav className={styles.nav}>
        {/* Navegación base: disponible para todos los usuarios que pueden comprar */}
        {canBuy() && baseNav.map(item => (
          <NavItem key={item.to} {...item} cartCount={cartCount} />
        ))}

        {/* Divisor visual si el usuario también puede vender */}
        {canSell() && (
          <>
            <div className={styles.divider} title="Herramientas de vendedor" />
            {sellerSection.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}

        {/* Perfil siempre visible */}
        <div className={styles.divider} />
        <NavItem to="/profile" icon={Settings} label="Mi Perfil" />
      </nav>
    </aside>
  );
}
