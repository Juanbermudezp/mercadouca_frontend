import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, User, Phone, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    firstName: '', lastName: '', phoneNumber: '',
    role: 'BUYER',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Cuenta creada exitosamente');
      navigate('/shop');
    } catch (err) {
      toast.error(err?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 460 }}>
        <div className={styles.logo}><Package size={36} strokeWidth={1.5} /></div>
        <h1 className={styles.title}>Crear Cuenta</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Nombre" placeholder="Juan" icon={<User size={15} />}
              value={form.firstName} onChange={set('firstName')} required />
            <Input label="Apellido" placeholder="Perez" icon={<User size={15} />}
              value={form.lastName} onChange={set('lastName')} required />
          </div>
          <Input label="Usuario" placeholder="juanperez"
            value={form.username} onChange={set('username')} required />
          <Input label="Correo" type="email" placeholder="juan@email.com"
            icon={<Mail size={15} />} value={form.email} onChange={set('email')} required />
          <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
            icon={<Lock size={15} />} value={form.password} onChange={set('password')} required />
          <Input label="Teléfono" placeholder="+503 7000-0000"
            icon={<Phone size={15} />} value={form.phoneNumber} onChange={set('phoneNumber')} />

          {/* Seller info banner */}
          <div style={{
            display: 'flex', gap: 10, padding: '12px 14px',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border)', alignItems: 'flex-start',
          }}>
            <Info size={16} style={{ color: 'var(--b300)', marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>¿Quieres vender en Mercaduca?</strong><br />
              Crea tu cuenta de comprador y luego solicita tu cuenta de vendedor
              desde tu perfil. Un administrador la revisará y aprobará.
            </p>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Crear Cuenta
          </Button>
        </form>

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.linkBlue}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
