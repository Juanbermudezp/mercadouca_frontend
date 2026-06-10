import { useState, useEffect } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { disputeService } from '../../services/disputes/disputeService';
import { orderService } from '../../services/orders/orderService';
import { Card, Badge, Spinner, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './BuyerPage.module.css';

const STATUS_COLOR = { OPEN:'orange', UNDER_REVIEW:'blue', RESOLVED_BUYER:'green', RESOLVED_SELLER:'purple', CLOSED:'gray' };
const STATUS_LABEL = { OPEN:'Abierta', UNDER_REVIEW:'En revisión', RESOLVED_BUYER:'Resuelta (tu favor)', RESOLVED_SELLER:'Resuelta (vendedor)', CLOSED:'Cerrada' };

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId:'', reason:'', description:'' });
  const [saving, setSaving] = useState(false);

  const load = () => disputeService.getMine({ page:0, size:20 }).then(r => setDisputes(r.data?.content||[])).finally(()=>setLoading(false));
  useEffect(() => {
    load();
    orderService.getMyOrders({ page:0, size:50 }).then(r => setOrders(r.data?.content||[]));
  }, []);

  const set = k => e => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async () => {
    if (!form.orderId || !form.reason || !form.description) { toast.error('Completa todos los campos'); return; }
    setSaving(true);
    try {
      await disputeService.open(form.orderId, { reason: form.reason, description: form.description });
      toast.success('Disputa abierta. El equipo la revisará pronto.');
      setShowForm(false); setForm({ orderId:'', reason:'', description:'' }); load();
    } catch (e) { toast.error(e?.message || 'Error al abrir disputa'); }
    finally { setSaving(false); }
  };

  const REASONS = ['Producto no llegó', 'Producto diferente al anunciado', 'Producto dañado', 'Cobro incorrecto', 'Vendedor no responde', 'Otro'];

  return (
    <div className={styles.page}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1 className={styles.title}>⚠️ Mis Disputas</h1>
        <Button icon={<Plus size={15}/>} variant="danger" onClick={() => setShowForm(v=>!v)}>Abrir Disputa</Button>
      </div>

      {showForm && (
        <Card style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>⚠️ Abrir Disputa</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Orden afectada *</label>
              <select style={{ width:'100%', padding:'10px 14px', background:'var(--bg-secondary)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:14, outline:'none' }}
                value={form.orderId} onChange={set('orderId')}>
                <option value="">Seleccionar orden</option>
                {orders.map(o => <option key={o.id} value={o.id}>#{o.orderNumber} — ${o.total?.toFixed(2)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Motivo *</label>
              <select style={{ width:'100%', padding:'10px 14px', background:'var(--bg-secondary)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:14, outline:'none' }}
                value={form.reason} onChange={set('reason')}>
                <option value="">Seleccionar motivo</option>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Descripción detallada *</label>
              <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe el problema con el mayor detalle posible..."
                style={{ width:'100%', padding:'10px 14px', background:'var(--bg-secondary)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:14, outline:'none', resize:'vertical', fontFamily:'var(--font-body)' }}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <Button variant="danger" onClick={submit} loading={saving} icon={<AlertTriangle size={14}/>}>Abrir Disputa</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {loading ? <div className={styles.center}><Spinner size={36}/></div> :
      disputes.length === 0 ? (
        <Empty icon={<AlertTriangle size={48}/>} title="Sin disputas" subtitle="No has abierto ninguna disputa" />
      ) : (
        <div className={styles.disputeList}>
          {disputes.map(d => (
            <Card key={d.id} className={styles.disputeCard}>
              <div className={styles.disputeHeader}>
                <div>
                  <p className={styles.disputeOrder}>Orden #{d.orderNumber}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString('es')}</p>
                </div>
                <Badge color={STATUS_COLOR[d.status]||'gray'}>{STATUS_LABEL[d.status]||d.status}</Badge>
              </div>
              <p className={styles.disputeReason}><strong>Motivo:</strong> {d.reason}</p>
              <p className={styles.disputeDesc}>{d.description}</p>
              {d.resolution && (
                <div className={styles.disputeResolution}>
                  <strong>✅ Resolución:</strong> {d.resolution}
                </div>
              )}
              {d.adminNotes && (
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8 }}><strong>Notas admin:</strong> {d.adminNotes}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
