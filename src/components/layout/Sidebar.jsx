import { NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, ShoppingCart, MessageCircle, Heart, Bell,
  FileText, BarChart2, Tag, Package, MapPin, AlertCircle,
  LayoutDashboard, Users, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { notificationService } from '../../services/notifications/notificationService';
import styles from './Sidebar.module.css';

const baseNav = [
  { to: '/cart',          icon: ShoppingCart, label: 'Carrito',         badge: 'cart' },
  { to: '/orders',        icon: FileText,     label: 'Mis Compras' },
  { to: '/wishlist',      icon: Heart,        label: 'Favoritos' },
  { to: '/disputes',      icon: AlertCircle,  label: 'Disputas' },
  { to: '/addresses',     icon: MapPin,       label: 'Direcciones' },
  { to: '/chat',          icon: MessageCircle,label: 'Chat' },
  { to: '/notifications', icon: Bell,         label: 'Notificaciones',  badge: 'notif' },
];

const sellerSection = [
  { to: '/seller/dashboard', icon: LayoutDashboard, label: 'Mi Reporte' },
  { to: '/seller/products',  icon: Package,          label: 'Productos' },
  { to: '/seller/orders',    icon: FileText,         label: 'Ventas' },
  { to: '/seller/disputes',  icon: AlertCircle,      label: 'Disputas' },
  { to: '/seller/coupons',   icon: Tag,              label: 'Cupones' },
];

const adminNav = [
  { to: '/admin/dashboard',  icon: BarChart2,     label: 'Dashboard' },
  { to: '/admin/orders',     icon: FileText,      label: 'Órdenes' },
  { to: '/admin/users',      icon: Users,         label: 'Gestión Usuarios' },
  { to: '/admin/products',   icon: Package,       label: 'Productos' },
  { to: '/admin/disputes',   icon: AlertCircle,   label: 'Disputas' },
  { to: '/admin/categories', icon: Tag,           label: 'Categorías' },
  { to: '/chat',             icon: MessageCircle, label: 'Chat' },
];

function NavItem({ to, icon: Icon, label, badge, cartCount, notifCount }) {
  const count = badge === 'cart' ? cartCount : badge === 'notif' ? notifCount : 0;
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      title={label}
    >
      <div className={styles.iconWrap}>
        <Icon size={20} />
        {count > 0 && (
          <span className={styles.badge}>{count > 99 ? '99+' : count}</span>
        )}
      </div>
    </NavLink>
  );
}

export default function Sidebar() {
  const { isAdmin, canSell, canBuy, user } = useAuth();
  const { cart } = useCart() || {};
  const cartCount = cart?.itemCount || 0;
  const [notifCount, setNotifCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user || isAdmin()) return;

    const fetchCount = () => {
      notificationService.getUnreadCount()
        .then(res => setNotifCount(res.data || 0))
        .catch(() => {});
    };

    fetchCount();
    intervalRef.current = setInterval(fetchCount, 30000); // cada 30s
    return () => clearInterval(intervalRef.current);
  }, [user]);

  // Resetear contador al entrar a /notifications (el NavLink lo detecta por isActive)
  // pero también al volver de esa ruta — simplificamos con un listener de location
  useEffect(() => {
    if (window.location.pathname === '/notifications') {
      setNotifCount(0);
    }
  });

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
        {canBuy() && baseNav.map(item => (
          <NavItem key={item.to} {...item} cartCount={cartCount} notifCount={notifCount} />
        ))}

        {canSell() && (
          <>
            <div className={styles.divider} title="Herramientas de vendedor" />
            {sellerSection.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}

        <div className={styles.divider} />
        <NavItem to="/profile" icon={Settings} label="Mi Perfil" />
      </nav>
    </aside>
  );
}
