import { useState, useEffect } from 'react';
import { User, Lock, Store, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/users/userService';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, refreshProfile, isSeller, isBuyer } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ firstName:'', lastName:'', phoneNumber:'', profilePicture:'' });
  const [passForm, setPassForm] = useState({ currentPassword:'', newPassword:'' });
  const [sellerForm, setSellerForm] = useState({ storeName:'', storeDescription:'', taxId:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Refrescar sesión al montar: detecta cambios de rol (ej: BUYER aprobado como SELLER)
    // sin necesitar que el usuario recargue la página o visite Notificaciones.
    refreshProfile().catch(() => {});

    userService.getMe().then(r => {
      const d = r.data;
      setProfile(d);
      setForm({ firstName: d.firstName||'', lastName: d.lastName||'', phoneNumber: d.phoneNumber||'', profilePicture: d.profilePicture||'' });
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (setter) => (k) => (e) => setter(p => ({...p, [k]: e.target.value}));

  const saveProfile = async () => {
    setSaving(true);
    try {
      await userService.updateMe(form);
      toast.success('Perfil actualizado');
      await refreshProfile();
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword) { toast.error('Completa ambos campos'); return; }
    if (passForm.newPassword.length < 8) { toast.error('La nueva contraseña debe tener al menos 8 caracteres'); return; }
    setSaving(true);
    try {
      await userService.changePassword(passForm);
      toast.success('Contraseña actualizada exitosamente');
      setPassForm({ currentPassword:'', newPassword:'' });
    } catch (e) { toast.error(e?.message || 'Contraseña actual incorrecta'); }
    finally { setSaving(false); }
  };

  const registerSeller = async () => {
    if (!sellerForm.storeName || !sellerForm.taxId) { toast.error('Completa los campos requeridos'); return; }
    setSaving(true);
    try {
      await userService.registerAsSeller(sellerForm);
      toast.success('Solicitud enviada. El equipo la revisará pronto.');
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const ROLE_COLOR = { ADMIN:'purple', SELLER:'blue', BUYER:'green' };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={40}/></div>;

  return (
    <div className={styles.page}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{(profile?.firstName?.[0] || profile?.username?.[0] || 'U').toUpperCase()}</div>
        <div>
          <h1 className={styles.name}>{profile?.firstName} {profile?.lastName}</h1>
          <p className={styles.username}>@{profile?.username} • {profile?.email}</p>
          <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
            {profile?.role === 'SELLER' && profile?.sellerProfile?.status === 'VERIFIED'
              ? <Badge color="green">✓ Vendedor Verificado</Badge>
              : profile?.role === 'SELLER'
                ? <><Badge color="blue">Vendedor</Badge><Badge color={profile.sellerProfile?.status==='REJECTED'?'red':'orange'}>{profile.sellerProfile?.status || 'PENDIENTE'}</Badge></>
                : profile?.role === 'ADMIN'
                  ? <Badge color="purple">Administrador</Badge>
                  : <Badge color="green">Comprador</Badge>
            }
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {['profile', 'password', isBuyer() && (!profile?.sellerProfile || profile?.sellerProfile?.status === 'REJECTED') && 'seller'].filter(Boolean).map(t => (
          <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`} onClick={() => setTab(t)}>
            {t==='profile' && <><User size={14}/> Perfil</>}
            {t==='password' && <><Lock size={14}/> Contraseña</>}
            {t==='seller' && <><Store size={14}/> Ser Vendedor</>}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>Información personal</h3>
          <div className={styles.grid}>
            <Input label="Nombre" value={form.firstName} onChange={set(setForm)('firstName')} />
            <Input label="Apellido" value={form.lastName} onChange={set(setForm)('lastName')} />
            <Input label="Teléfono" value={form.phoneNumber} onChange={set(setForm)('phoneNumber')} />
            <Input label="URL foto de perfil" value={form.profilePicture} onChange={set(setForm)('profilePicture')} />
          </div>
          <Button icon={<Save size={15}/>} onClick={saveProfile} loading={saving} style={{ marginTop:16 }}>Guardar cambios</Button>
        </Card>
      )}

      {tab === 'password' && (
        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>Cambiar contraseña</h3>
          <div className={styles.grid} style={{ gridTemplateColumns:'1fr' }}>
            <Input label="Contraseña actual" type="password" value={passForm.currentPassword} onChange={set(setPassForm)('currentPassword')} required />
            <Input label="Nueva contraseña" type="password" value={passForm.newPassword} onChange={set(setPassForm)('newPassword')} hint="Mínimo 8 caracteres" required />
          </div>
          <Button icon={<Lock size={15}/>} onClick={changePassword} loading={saving} style={{ marginTop:16 }}>Cambiar contraseña</Button>
        </Card>
      )}

      {tab === 'seller' && (
        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>
            {profile?.sellerProfile?.status === 'REJECTED' ? 'Re-solicitar cuenta de vendedor' : 'Registrarse como vendedor'}
          </h3>
          {profile?.sellerProfile?.status === 'REJECTED' && (
            <p style={{ fontSize:13, color:'#ef4444', marginBottom:8, padding:'8px 12px', background:'#fef2f2', borderRadius:'var(--radius-sm)' }}>
              Tu solicitud anterior fue rechazada. Puedes enviar una nueva solicitud con información actualizada.
            </p>
          )}
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>Tu solicitud será revisada por el equipo de Mercaduca. Una vez aprobada podrás publicar productos.</p>
          <div className={styles.grid}>
            <Input label="Nombre de tienda *" value={sellerForm.storeName} onChange={set(setSellerForm)('storeName')} required />
            <Input label="NIT / Tax ID *" value={sellerForm.taxId} onChange={set(setSellerForm)('taxId')} required />
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Descripción de tienda</label>
              <textarea value={sellerForm.storeDescription} onChange={e => setSellerForm(p=>({...p, storeDescription:e.target.value}))} rows={3}
                style={{ width:'100%', padding:'10px 14px', background:'var(--bg-secondary)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:14, outline:'none', resize:'vertical', fontFamily:'var(--font-body)' }} />
            </div>
          </div>
          <Button icon={<Store size={15}/>} onClick={registerSeller} loading={saving} style={{ marginTop:16 }}>Enviar solicitud</Button>
        </Card>
      )}

      {profile?.sellerProfile && (
        <Card className={styles.statsCard}>
          <h3 className={styles.cardTitle}>🏪 {profile.sellerProfile.storeName}</h3>
          <div className={styles.statsRow}>
            <div className={styles.stat}><p className={styles.statVal}>{profile.sellerProfile.averageRating?.toFixed(1)||'0.0'}⭐</p><p className={styles.statLabel}>Calificación</p></div>
            <div className={styles.stat}><p className={styles.statVal}>{profile.sellerProfile.totalReviews||0}</p><p className={styles.statLabel}>Reseñas</p></div>
            <div className={styles.stat}><p className={styles.statVal}>{profile.sellerProfile.totalSales||0}</p><p className={styles.statLabel}>Ventas</p></div>
          </div>
        </Card>
      )}
    </div>
  );
}
