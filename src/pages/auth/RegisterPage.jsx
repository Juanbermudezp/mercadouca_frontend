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
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'El nombre es requerido';
    if (!form.lastName.trim()) e.lastName = 'El apellido es requerido';
    if (!form.username.trim()) e.username = 'El usuario es requerido';
    else if (form.username.length < 3) e.username = 'Mínimo 3 caracteres';
    if (!form.email.trim()) e.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es requerida';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Cuenta creada exitosamente');
      navigate('/shop');
    } catch (err) {
      const msg = err?.message || 'Error al registrar';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('correo')) {
        setErrors({ email: 'Este correo ya está registrado' });
      } else if (msg.toLowerCase().includes('username') || msg.toLowerCase().includes('usuario')) {
        setErrors({ username: 'Este nombre de usuario ya está en uso' });
      } else {
        toast.error(msg);
      }
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
              value={form.firstName} onChange={set('firstName')} error={errors.firstName} required />
            <Input label="Apellido" placeholder="Perez" icon={<User size={15} />}
              value={form.lastName} onChange={set('lastName')} error={errors.lastName} required />
          </div>
          <Input label="Usuario" placeholder="juanperez"
            value={form.username} onChange={set('username')} error={errors.username} required />
          <Input label="Correo" type="email" placeholder="juan@email.com"
            icon={<Mail size={15} />} value={form.email} onChange={set('email')} error={errors.email} required />
          <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
            icon={<Lock size={15} />} value={form.password} onChange={set('password')} error={errors.password} required />
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
