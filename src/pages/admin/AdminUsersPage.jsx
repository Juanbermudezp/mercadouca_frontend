import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin/adminService';
import { Card, Badge, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import styles from './AdminPage.module.css';

const ROLE_COLOR = { ADMIN: 'purple', SELLER: 'blue', BUYER: 'green' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = () => {
    setLoading(true);
    adminService.getAllUsers({ page, size: 15 })
      .then(r => {
        setUsers(r.data?.content || []);
        setTotalPages(r.data?.totalPages || 0);
      })
      .catch(() => toast.error('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const toggle = async (id, enabled) => {
    try {
      await adminService.toggleUserStatus(id);
      toast.success(enabled ? 'Usuario desactivado' : 'Usuario activado');
      load();
    } catch { toast.error('Error al cambiar estado'); }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Usuarios del Sistema</h1>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
          <Spinner size={36}/>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {users.length === 0 && (
              <p style={{ color:'var(--text-muted)', textAlign:'center', padding:40 }}>
                No hay usuarios registrados
              </p>
            )}
            {users.map(u => (
              <Card key={u.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <p className={styles.name}>{u.firstName} {u.lastName}</p>
                    <Badge color={ROLE_COLOR[u.role] || 'gray'}>{u.role}</Badge>
                    {!u.enabled && <Badge color="red">Inactivo</Badge>}
                  </div>
                  <p className={styles.sub}>@{u.username} • {u.email}</p>
                  <p className={styles.sub}>
                    Registrado: {new Date(u.createdAt).toLocaleDateString('es')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={u.enabled ? 'danger' : 'outline'}
                  onClick={() => toggle(u.id, u.enabled)}
                >
                  {u.enabled ? 'Desactivar' : 'Activar'}
                </Button>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{
                    width:34, height:34, borderRadius:'var(--radius-sm)',
                    border:'1.5px solid', fontSize:13, fontWeight:500,
                    cursor:'pointer', transition:'all .2s',
                    borderColor: i===page ? 'var(--b300)' : 'var(--border)',
                    background: i===page ? 'var(--b300)' : 'var(--card-bg)',
                    color: i===page ? '#fff' : 'var(--text-secondary)'
                  }}>
                  {i+1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}