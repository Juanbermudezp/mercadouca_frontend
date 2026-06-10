import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { addressService } from '../../services/addresses/addressService';
import { Card, Badge, Spinner, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './BuyerPage.module.css';

const EMPTY_FORM = { alias:'', fullName:'', street:'', city:'', state:'', country:'SV', zipCode:'', phone:'', defaultAddress:false };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => addressService.getAll().then(r => setAddresses(r.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const openEdit = (a) => {
    setEditing(a.id);
    setForm({ alias:a.alias, fullName:a.fullName, street:a.street, city:a.city, state:a.state, country:a.country, zipCode:a.zipCode||'', phone:a.phone||'', defaultAddress:a.defaultAddress });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.alias || !form.fullName || !form.street || !form.city) { toast.error('Completa los campos requeridos'); return; }
    setSaving(true);
    try {
      if (editing) { await addressService.update(editing, form); toast.success('Dirección actualizada'); }
      else { await addressService.create(form); toast.success('Dirección guardada'); }
      setShowForm(false); setEditing(null); setForm(EMPTY_FORM); load();
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    await addressService.remove(id); toast.success('Dirección eliminada'); load();
  };

  const setDefault = async (id) => {
    await addressService.setDefault(id); toast.success('Dirección predeterminada actualizada'); load();
  };

  return (
    <div className={styles.page}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1 className={styles.title}>📍 Mis Direcciones</h1>
        <Button icon={<Plus size={15}/>} onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}>Nueva Dirección</Button>
      </div>

      {showForm && (
        <Card style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>{editing ? '✏️ Editar' : '➕ Nueva'} Dirección</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Input label="Alias *" placeholder="Casa, Oficina..." value={form.alias} onChange={set('alias')} required />
            <Input label="Nombre completo *" value={form.fullName} onChange={set('fullName')} required />
            <div style={{ gridColumn:'1/-1' }}><Input label="Calle / Dirección *" value={form.street} onChange={set('street')} required /></div>
            <Input label="Ciudad *" value={form.city} onChange={set('city')} required />
            <Input label="Estado / Departamento *" value={form.state} onChange={set('state')} required />
            <Input label="País *" value={form.country} onChange={set('country')} required />
            <Input label="Código Postal" value={form.zipCode} onChange={set('zipCode')} />
            <Input label="Teléfono" value={form.phone} onChange={set('phone')} placeholder="+503 7000-0000" />
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', gridColumn:'1/-1', fontSize:13 }}>
              <input type="checkbox" checked={form.defaultAddress} onChange={e => setForm(p => ({...p, defaultAddress: e.target.checked}))} style={{ accentColor:'var(--b300)', width:16, height:16 }}/>
              Establecer como dirección predeterminada
            </label>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <Button onClick={save} loading={saving}>{editing ? 'Actualizar' : 'Guardar'}</Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
          </div>
        </Card>
      )}

      {loading ? <div className={styles.center}><Spinner size={36}/></div> :
      addresses.length === 0 ? (
        <Empty icon={<MapPin size={48}/>} title="Sin direcciones" subtitle="Agrega una dirección de envío para tus compras"/>
      ) : (
        <div className={styles.addrGrid}>
          {addresses.map(a => (
            <Card key={a.id} className={styles.addrCard}>
              {a.defaultAddress && <div className={styles.addrDefault}><Badge color="blue" size="sm">⭐ Predeterminada</Badge></div>}
              <p className={styles.addrAlias}>{a.alias}</p>
              <p className={styles.addrName}>{a.fullName}</p>
              <p className={styles.addrLine}>{a.street}</p>
              <p className={styles.addrLine}>{a.city}, {a.state}, {a.country} {a.zipCode}</p>
              {a.phone && <p className={styles.addrLine}>📞 {a.phone}</p>}
              <div className={styles.addrActions}>
                <Button size="sm" variant="ghost" icon={<Pencil size={12}/>} onClick={() => openEdit(a)}>Editar</Button>
                {!a.defaultAddress && <Button size="sm" variant="outline" icon={<Star size={12}/>} onClick={() => setDefault(a.id)}>Predeterminar</Button>}
                <Button size="sm" variant="danger" icon={<Trash2 size={12}/>} onClick={() => del(a.id)}>Eliminar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
