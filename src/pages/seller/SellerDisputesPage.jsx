import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { disputeService } from '../../services/disputes/disputeService';
import { Card, Badge, Spinner, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import styles from './SellerPage.module.css';

const STATUS_COLOR = {
  OPEN: 'orange', UNDER_REVIEW: 'blue',
  RESOLVED_BUYER: 'green', RESOLVED_SELLER: 'purple', CLOSED: 'gray',
};
const STATUS_LABEL = {
  OPEN: 'Abierta', UNDER_REVIEW: 'En revisión',
  RESOLVED_BUYER: 'Resuelta (comprador)', RESOLVED_SELLER: 'Resuelta (vendedor)',
  CLOSED: 'Cerrada',
};

function ResponseForm({ disputeId, onDone }) {
  const [form, setForm] = useState({ sellerResponse: '', sellerProposedSolution: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.sellerResponse.trim()) { toast.error('Ingresa una respuesta'); return; }
    setSaving(true);
    try {
      await disputeService.sellerRespond(disputeId, form);
      toast.success('Respuesta enviada');
      onDone();
    } catch (e) { toast.error(e?.message || 'Error al enviar'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      marginTop: 12, padding: 14, background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Responder disputa</p>
      <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
        Tu respuesta *
      </label>
      <textarea value={form.sellerResponse} onChange={set('sellerResponse')} rows={3}
        placeholder="Explica tu versión de los hechos..."
        style={{
          width: '100%', padding: '8px 12px', background: 'var(--card-bg)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)', fontSize: 13, outline: 'none',
          resize: 'vertical', fontFamily: 'var(--font-body)',
          boxSizing: 'border-box', marginBottom: 10,
        }} />
      <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
        Solución propuesta (opcional)
      </label>
      <textarea value={form.sellerProposedSolution} onChange={set('sellerProposedSolution')} rows={2}
        placeholder="¿Cómo propones resolver este problema?"
        style={{
          width: '100%', padding: '8px 12px', background: 'var(--card-bg)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)', fontSize: 13, outline: 'none',
          resize: 'vertical', fontFamily: 'var(--font-body)',
          boxSizing: 'border-box', marginBottom: 12,
        }} />
      <Button size="sm" onClick={submit} loading={saving} icon={<MessageSquare size={13} />}>
        Enviar respuesta
      </Button>
    </div>
  );
}

export default function SellerDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const load = () => {
    setLoading(true);
    disputeService.getSellerDisputes({ page: 0, size: 20 })
      .then(r => setDisputes(r.data?.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = (id) => setExpandedId(v => v === id ? null : id);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: '#f59e0b' }} />
            Disputas de mis Productos
          </h1>
          <p className={styles.sub}>{disputes.length} disputa(s) encontrada(s)</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.center}><Spinner size={36} /></div>
      ) : disputes.length === 0 ? (
        <Empty icon={<AlertTriangle size={48} />} title="Sin disputas"
          subtitle="No hay disputas relacionadas con tus productos" />
      ) : (
        <div className={styles.list}>
          {disputes.map(d => (
            <Card key={d.id} className={styles.row} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>Orden #{d.orderNumber}</p>
                    <Badge color={STATUS_COLOR[d.status] || 'gray'}>
                      {STATUS_LABEL[d.status] || d.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Comprador: {d.buyerName} ·{' '}
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString('es') : ''}
                  </p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>
                    <strong>Motivo:</strong> {d.reason}
                  </p>
                </div>
                <button onClick={() => toggle(d.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4,
                }}>
                  {expandedId === d.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {expandedId === d.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    {d.description}
                  </p>

                  {d.sellerResponse ? (
                    <div style={{
                      padding: 12, background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)', marginBottom: 8,
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        Tu respuesta:
                      </p>
                      <p style={{ fontSize: 13 }}>{d.sellerResponse}</p>
                      {d.sellerProposedSolution && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                          <strong>Solución propuesta:</strong> {d.sellerProposedSolution}
                        </p>
                      )}
                    </div>
                  ) : (
                    d.status === 'OPEN' && (
                      respondingId === d.id
                        ? <ResponseForm disputeId={d.id} onDone={() => { setRespondingId(null); load(); }} />
                        : (
                          <Button size="sm" variant="outline" onClick={() => setRespondingId(d.id)}
                            icon={<MessageSquare size={13} />}>
                            Responder disputa
                          </Button>
                        )
                    )
                  )}

                  {d.resolution && (
                    <div style={{
                      marginTop: 10, padding: 10, background: '#dcfce7',
                      borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #16a34a',
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                        ✅ Resolución del administrador:
                      </p>
                      <p style={{ fontSize: 13, marginTop: 4 }}>{d.resolution}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
