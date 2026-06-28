import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './Auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'El correo es requerido';
    if (!form.password) e.password = 'La contrasena es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form);
      toast.success('Bienvenido, ' + user.username);
      const redirects = { ADMIN: '/admin/dashboard', SELLER: '/shop', BUYER: '/shop' };
      navigate(redirects[user.role] || '/shop');
    } catch (err) {
      setErrors({ general: err?.message || 'Correo o contraseña incorrectos' });
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Package size={40} strokeWidth={1.5} /></div>
        <h1 className={styles.title}>Mercaduca</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Correo Electronico" type="email" placeholder="Ingresa tu correo"
            icon={<Mail size={16} />} value={form.email}
            onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors({}); }}
            error={errors.email} required />
          <Input label="Contrasena" type="password" placeholder="Ingresa tu contrasena"
            icon={<Lock size={16} />} value={form.password}
            onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors({}); }}
            error={errors.password} required />
          {errors.general && (
            <div style={{
              padding: '10px 14px', background: '#fef2f2', border: '1.5px solid #fca5a5',
              borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: 13, fontWeight: 500,
            }}>
              {errors.general}
            </div>
          )}
          <Button type="submit" fullWidth loading={loading} size="lg">Iniciar Sesion</Button>
        </form>
        <p className={styles.footer}>No tienes cuenta? <Link to="/register" className={styles.linkBlue}>Registrate</Link></p>
      </div>
    </div>
  );
}
