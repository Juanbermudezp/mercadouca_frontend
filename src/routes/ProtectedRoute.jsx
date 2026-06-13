import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Control de acceso basado en roles.
 *
 * Regla de negocio:
 *   SELLER hereda todas las capacidades de BUYER.
 *   Si una ruta permite ['BUYER'], también permite SELLER.
 *   ADMIN no hereda BUYER/SELLER (tiene su propio panel).
 */
export function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const userRole = user.role;
    // SELLER puede acceder a rutas de BUYER
    const effectiveRoles = roles.includes('BUYER') && !roles.includes('SELLER')
      ? [...roles, 'SELLER']
      : roles;
    if (!effectiveRoles.includes(userRole)) {
      // Redirigir al home correcto según rol
      const home = { ADMIN: '/admin/dashboard', SELLER: '/shop', BUYER: '/shop' };
      return <Navigate to={home[userRole] || '/shop'} replace />;
    }
  }
  return <Outlet />;
}

export function PublicRoute() {
  const { user } = useAuth();
  if (user) {
    const redirects = {
      ADMIN: '/admin/dashboard',
      SELLER: '/shop',
      BUYER: '/shop',
    };
    return <Navigate to={redirects[user.role] || '/shop'} replace />;
  }
  return <Outlet />;
}
