import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { disputeService } from '../../services/disputes/disputeService';
import { Card, Badge, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import styles from './AdminPage.module.css';

const STATUS_COLOR = { OPEN:'orange', UNDER_REVIEW:'blue', RESOLVED_BUYER:'green', RESOLVED_SELLER:'purple', CLOSED:'gray' };
const STATUS_LABEL = { OPEN:'Abierta', UNDER_REVIEW:'En revision', RESOLVED_BUYER:'Resuelta (comprador)', RESOLVED_SELLER:'Resuelta (vendedor)', CLOSED:'Cerrada' };

function ResolvePanel({ dispute, onDone, onCancel }) {
  const [form, setForm] = useState({ status: 'RESOLVED_BUYER', resolution: '', adminNotes: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const submit = async () => {
    if (!form.resolution.trim()) { toast.error('Ingresa la resolucion'); return; }
    setSaving(true);
    try {
      await disputeService.resolve(dispute.id, { ...form, adminNotes: form.adminNotes || form.resolution });
      toast.success('Disputa resuelta'); onDone();
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ marginTop:12, padding:14, background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--border)' }}>
      <p style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Resolver disputa</p>
      <div style={{ marginBottom:10 }}>
        <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Resolucion a favor de:</label>
        <div style={{ display:'flex', gap:8 }}>
          {['RESOLVED_BUYER','RESOLVED_SELLER'].map(s => (
            <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
              style={{ flex:1, padding:'8px', borderRadius:'var(--radius-sm)', border:'1.5px solid', fontSize:12,
                fontWeight:500, cursor:'pointer', transition:'all .15s',
                borderColor: form.status === s ? 'var(--b300)' : 'var(--border)',
                background: form.status === s ? 'var(--b300)' : 'var(--card-bg)',
                color: form.status === s ? '#fff' : 'var(--text-secondary)' }}>
              {s === 'RESOLVED_BUYER' ? 'Comprador' : 'Vendedor'}
            </button>
          ))}
        </div>
      </div>
      <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Resolucion *</label>
      <textarea value={form.resolution} onChange={set('resolution')} rows={2}
        placeholder="Describe la resolucion..."
        style={{ width:'100%', padding:'8px 12px', background:'var(--card-bg)', border:'1.5px solid var(--border)',
          borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:13, outline:'none',
          resize:'vertical', fontFamily:'var(--font-body)', boxSizing:'border-box', marginBottom:8 }}/>
      <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Notas internas (opcional)</label>
      <textarea value={form.adminNotes} onChange={set('adminNotes')} rows={1}
        placeholder="Notas solo para admin..."
        style={{ width:'100%', padding:'8px 12px', background:'var(--card-bg)', border:'1.5px solid var(--border)',
          borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:13, outline:'none',
          resize:'vertical', fontFamily:'var(--font-body)', boxSizing:'border-box', marginBottom:12 }}/>
      <div style={{ display:'flex', gap:8 }}>
        <Button size="sm" onClick={submit} loading={saving}>Confirmar</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const load = () => {
    setLoading(true);
    disputeService.getAll({ page:0, size:20 }).then(r => setDisputes(r.data?.content || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Disputas</h1>
      {loading
        ? <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner/></div>
        : (
          <div className={styles.list}>
            {disputes.map(d => (
              <Card key={d.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <p className={styles.name}>#{d.orderNumber}</p>
                    <Badge color={STATUS_COLOR[d.status] || 'gray'}>{STATUS_LABEL[d.status] || d.status}</Badge>
                  </div>
                  <p className={styles.sub}><strong>Comprador:</strong> {d.buyerName}</p>
                  <p className={styles.sub}><strong>Motivo:</strong> {d.reason}</p>
                  <p className={styles.sub} style={{ marginTop:4 }}>{d.description}</p>
                  {d.resolution && <p className={styles.sub} style={{ marginTop:6, color:'var(--success)' }}><strong>Resolucion:</strong> {d.resolution}</p>}
                  {resolvingId === d.id && <ResolvePanel dispute={d} onDone={() => { setResolvingId(null); load(); }} onCancel={() => setResolvingId(null)}/>}
                </div>
                {['OPEN','UNDER_REVIEW'].includes(d.status) && resolvingId !== d.id && <Button size="sm" onClick={() => setResolvingId(d.id)}>Resolver</Button>}
              </Card>
            ))}
            {disputes.length === 0 && <p style={{ color:'var(--text-muted)', textAlign:'center', padding:40 }}>No hay disputas</p>}
          </div>
        )
      }
    </div>
  );
}
