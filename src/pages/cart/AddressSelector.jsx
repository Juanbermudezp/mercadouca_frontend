import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './CheckoutPage.module.css';

/**
 * Selector de dirección de envío.
 * Permite elegir una dirección guardada o ingresar una nueva.
 * Llama onSelect(addrData, isNew) cuando el usuario elige.
 */
export default function AddressSelector({ addresses, selectedId, onSelect }) {
  const [useNew, setUseNew] = useState(false);
  const [form, setForm] = useState({
    alias: '', fullName: '', street: '', city: '',
    state: '', country: 'El Salvador', zipCode: '', phone: '',
  });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const applyNew = () => {
    if (!form.street || !form.city) return;
    onSelect({
      street: form.street, city: form.city,
      country: form.country || 'El Salvador', zipCode: form.zipCode || '',
      newAddrData: { ...form, defaultAddress: false },
    }, true);
  };

  return (
    <div>
      <h3 className={styles.cardTitle}><MapPin size={16} /> Dirección de entrega</h3>

      {addresses.length > 0 && (
        <div className={styles.addrList}>
          {addresses.map(a => (
            <button key={a.id}
              className={`${styles.addrBtn} ${selectedId === a.id && !useNew ? styles.addrBtnActive : ''}`}
              onClick={() => { setUseNew(false); onSelect({ street: a.street, city: a.city, country: a.country, zipCode: a.zipCode || '', id: a.id }, false); }}>
              <strong>{a.alias}</strong> — {a.street}, {a.city}
              {a.defaultAddress && <span style={{ fontSize: 11, color: 'var(--b300)', marginLeft: 8 }}>★</span>}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => setUseNew(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1.5px dashed var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px',
          cursor: 'pointer', color: 'var(--b300)', fontSize: 13, width: '100%', marginTop: 10,
        }}>
        <Plus size={14} /> {useNew ? 'Cancelar nueva dirección' : 'Usar otra dirección'}
      </button>

      {useNew && (
        <div className={styles.formGrid} style={{ marginTop: 12 }}>
          <Input label="Nombre completo" value={form.fullName} onChange={set('fullName')} placeholder="Juan Pérez" />
          <Input label="Alias (ej: Casa)" value={form.alias} onChange={set('alias')} placeholder="Casa" />
          <div style={{ gridColumn: '1/-1' }}>
            <Input label="Dirección / Calle *" value={form.street} onChange={set('street')} required />
          </div>
          <Input label="Ciudad *" value={form.city} onChange={set('city')} required />
          <Input label="País *" value={form.country} onChange={set('country')} />
          <Input label="Estado / Departamento" value={form.state} onChange={set('state')} />
          <Input label="Código Postal" value={form.zipCode} onChange={set('zipCode')} />
          <Button size="sm" onClick={applyNew} disabled={!form.street || !form.city} style={{ alignSelf: 'flex-end' }}>
            Usar esta dirección
          </Button>
        </div>
      )}
    </div>
  );
}
