import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, LogOut, User, Package, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, canBuy, canRequestSeller, hasSellerRequestPending } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?keyword=${encodeURIComponent(query)}`);
  };

  return (
    <header className={styles.navbar}>
      {/* Banner de solicitud de vendedor: solo para usuarios que aún no son vendedores */}
      {canRequestSeller() && (
        <a href="/profile" className={styles.sellerLink}>
          <Package size={14} />
          ¿Quieres vender en Mercaduca? Solicita tu cuenta de vendedor
        </a>
      )}

      {/* Banner de solicitud pendiente */}
      {hasSellerRequestPending() && (
        <span className={styles.sellerLinkPending}>
          <Clock size={14} />
          Tu solicitud de vendedor está en revisión
        </span>
      )}

      {/* Barra de búsqueda: visible para usuarios que pueden comprar */}
      {canBuy() && (
        <form className={styles.search} onSubmit={handleSearch}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar en Mercaduca"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </form>
      )}

      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={toggle} title="Cambiar tema">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className={styles.profileWrap}>
          <button className={styles.avatar} onClick={() => setMenuOpen(v => !v)}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              <div className={styles.menuHeader}>
                <p className={styles.menuName}>{user?.firstName} {user?.lastName}</p>
                <p className={styles.menuEmail}>{user?.email}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {user?.role}
                  {user?.sellerProfile?.status === 'SUSPENDED' && ' — ⚠️ Suspendido'}
                </p>
              </div>
              <button className={styles.menuItem}
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}>
                <User size={14} /> Mi Perfil
              </button>
              <button className={styles.menuItem}
                onClick={() => { logout(); navigate('/login'); }}>
                <LogOut size={14} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
