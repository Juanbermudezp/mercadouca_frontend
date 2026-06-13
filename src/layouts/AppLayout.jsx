import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import BlockedScreen from '../pages/auth/BlockedScreen';
import { useAuth } from '../context/AuthContext';
import styles from './AppLayout.module.css';

/**
 * Layout principal de la aplicación.
 * Si la cuenta del usuario está bloqueada (accountNonLocked=false),
 * muestra la pantalla de bloqueo en lugar del contenido normal.
 */
export default function AppLayout() {
  const { isBlocked } = useAuth();

  if (isBlocked()) {
    return <BlockedScreen />;
  }

  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.main}>
        <Navbar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
