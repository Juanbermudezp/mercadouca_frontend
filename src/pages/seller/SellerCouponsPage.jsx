import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponService } from '../../services/coupons/couponService';
import { Card, Badge, Spinner, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './SellerPage.module.css';

const EMPTY_FORM = {
  code:'', description:'', discountType:'PERCENTAGE', discountValue:'',
  minimumOrderAmount:'', maximumDiscount:'', startDate:'', endDate:'', usageLimit:'',
};

function getCouponStatus(c) {
  if (!c.active) return { label: 'Inactivo', color: 'gray' };
  const now = new Date();
  const start = new Date(c.startDate);
  const end   = new Date(c.endDate);
  if (now < start) return { label: 'Programado', color: 'blue' };
  if (now > end)   return { label: 'Expirado',   color: 'red'  };
  if (c.usageLimit && c.usageCount >= c.usageLimit)
                   return { label: 'Agotado',    color: 'orange' };
  return           { label: 'Activo',    color: 'green' };
}

function localNow() {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [validating, setValidating] = useState(false);
  const [testCode, setTestCode] = useState('');

  const load = () =>
    couponService.getMine({ page:0, size:30 })
      .then(r => setCoupons(r.data?.content || []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const openForm = () => {
    setForm({ ...EMPTY_FORM, startDate: localNow() });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.code || !form.discountValue || !form.startDate || !form.endDate) {
      toast.error('Completa los campos requeridos'); return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error('La fecha fin debe ser posterior a la fecha inicio'); return;
    }
    setSaving(true);
    try {
      await couponService.create({
        ...form,
        discountValue:      parseFloat(form.discountValue),
        minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : null,
        maximumDiscount:    form.maximumDiscount    ? parseFloat(form.maximumDiscount)    : null,
        usageLimit:         form.usageLimit         ? parseInt(form.usageLimit)           : null,
      });
      toast.success('Cupon creado exitosamente');
      setShowForm(false); setForm(EMPTY_FORM); load();
    } catch (e) { toast.error(e?.message || 'Error al crear cupon'); }
    finally { setSaving(false); }
  };

  const deactivate = async (id) => {
    if (!confirm('Desactivar este cupon?')) return;
    try { await couponService.deactivate(id); toast.success('Cupon desactivado'); load(); }
    catch (e) { toast.error(e?.message || 'Error'); }
  };

  const deletePermanently = async (id) => {
    if (!confirm('Eliminar este cupon definitivamente? Esta accion no se puede deshacer.')) return;
    try { await couponService.deletePermanently(id); toast.success('Cupon eliminado'); load(); }
    catch (e) { toast.error(e?.message || 'Error al eliminar'); }
  };

  const validate = async () => {
    if (!testCode.trim()) return;
    setValidating(true);
    try {
      const res = await couponService.validate({ code: testCode.trim() });
      const c = res.data;
      if (c.valid) {
        const desc = c.discountType === 'PERCENTAGE'
          ? c.discountValue + '% off' : '$' + c.discountValue + ' off';
        toast.success('Cupon valido - ' + desc);
      } else { toast.error('Cupon invalido o expirado'); }
    } catch { toast.error('Cupon no encontrado'); }
    finally { setValidating(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Cupones</h1>
          <p className={styles.sub}>{coupons.length} cupones</p>
        </div>
        <Button icon={<Plus size={15}/>} onClick={openForm}>Nuevo Cupon</Button>
      </div>

      <Card style={{ padding:16, marginBottom:16 }}>
        <p style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'var(--text-secondary)' }}>
          Validar codigo
        </p>
        <div style={{ display:'flex', gap:10 }}>
          <input value={testCode} onChange={e => setTestCode(e.target.value)}
            placeholder="Ingresa el codigo..."
            style={{ flex:1, padding:'9px 14px', background:'var(--bg-secondary)',
              border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
              color:'var(--text-primary)', fontSize:14, outline:'none' }}/>
          <Button size="sm" onClick={validate} loading={validating}>Validar</Button>
        </div>
      </Card>

      {showForm && (
        <Card className={styles.formCard}>
          <h3 className={styles.formTitle}>Nuevo Cupon</h3>
          <div className={styles.formGrid}>
            <Input label="Codigo *" value={form.code} onChange={set('code')} placeholder="DESCUENTO10" required />
            <div>
              <label className={styles.label}>Tipo *</label>
              <select className={styles.select} value={form.discountType} onChange={set('discountType')}>
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED_AMOUNT">Monto fijo ($)</option>
              </select>
            </div>
            <Input label={form.discountType === 'PERCENTAGE' ? 'Porcentaje (%) *' : 'Monto ($) *'}
              type="number" step="0.01" value={form.discountValue} onChange={set('discountValue')} required />
            <Input label="Limite de usos" type="number" value={form.usageLimit}
              onChange={set('usageLimit')} placeholder="Sin limite" />
            <Input label="Monto minimo ($)" type="number" step="0.01"
              value={form.minimumOrderAmount} onChange={set('minimumOrderAmount')} />
            <Input label="Descuento maximo ($)" type="number" step="0.01"
              value={form.maximumDiscount} onChange={set('maximumDiscount')} />
            <Input label="Fecha inicio *" type="datetime-local" value={form.startDate}
              onChange={set('startDate')} required />
            <Input label="Fecha fin *" type="datetime-local" value={form.endDate}
              onChange={set('endDate')} required />
            <div className={styles.span2}>
              <Input label="Descripcion" value={form.description} onChange={set('description')}
                placeholder="Descripcion del cupon..." />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button onClick={save} loading={saving}>Crear Cupon</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {loading ? <div className={styles.center}><Spinner size={36}/></div> :
      coupons.length === 0 ? (
        <Empty icon={<Tag size={48}/>} title="Sin cupones" subtitle="Crea cupones para atraer mas compradores"/>
      ) : (
        <div className={styles.list}>
          {coupons.map(c => {
            const status = getCouponStatus(c);
            const isInactive = !c.active;
            return (
              <Card key={c.id} className={styles.row}>
                <div className={styles.rowInfo}>
                  <div className={styles.rowTitleRow}>
                    <p className={styles.rowTitle} style={{ fontFamily:'var(--font-display)', letterSpacing:1 }}>
                      {c.code}
                    </p>
                    <Badge color={status.color}>{status.label}</Badge>
                  </div>
                  <p className={styles.rowSub}>
                    {c.discountType === 'PERCENTAGE' ? c.discountValue + '% off' : '$' + c.discountValue + ' off'}
                    {' | '}Usos: {c.usageCount}/{c.usageLimit || 'Ilimitado'}
                    {' | '}Hasta: {new Date(c.endDate).toLocaleDateString('es')}
                  </p>
                </div>
                <div className={styles.rowActions}>
                  {isInactive ? (
                    /* Cupon ya desactivado: mostrar boton de eliminacion definitiva */
                    <Button size="sm" variant="danger" icon={<Trash2 size={13}/>}
                      onClick={() => deletePermanently(c.id)}>
                      Eliminar
                    </Button>
                  ) : (
                    /* Cupon activo/programado: mostrar boton de desactivacion */
                    <Button size="sm" variant="outline" icon={<XCircle size={13}/>}
                      onClick={() => deactivate(c.id)}>
                      Desactivar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
