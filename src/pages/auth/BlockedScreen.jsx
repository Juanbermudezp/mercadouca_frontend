import { Ban, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

/**
 * Pantalla que se muestra cuando la cuenta del usuario está bloqueada.
 * El bloqueo es permanente — accountNonLocked = false.
 */
export default function BlockedScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 24,
    }}>
      <div style={{
        maxWidth: 440, width: '100%', textAlign: 'center',
        background: 'var(--card-bg)', borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)', padding: '40px 32px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#fee2e2', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Ban size={32} color="#ef4444" />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Cuenta bloqueada
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          Tu cuenta ha sido bloqueada permanentemente por el equipo de administración de Mercaduca.
          {user?.sellerProfile?.rejectionReason && (
            <>
              <br /><br />
              <strong>Motivo:</strong> {user.sellerProfile.rejectionReason}
            </>
          )}
        </p>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
          padding: '14px 16px', marginBottom: 24, textAlign: 'left',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Si crees que este bloqueo es un error, puedes contactar al equipo de soporte:
          </p>
          <a href="mailto:soporte@mercaduca.com"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--b300)', marginTop: 8, textDecoration: 'none' }}>
            <Mail size={14} /> soporte@mercaduca.com
          </a>
        </div>

        <Button variant="danger" fullWidth onClick={handleLogout} icon={<LogOut size={15} />}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
