import { useState, useEffect } from 'react';
import { Trash2, Search, Pencil, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/products/productService';
import { categoryService } from '../../services/categories/categoryService';
import { Card, Badge, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './AdminPage.module.css';

const STATUS_COLOR = { ACTIVE: 'green', INACTIVE: 'gray', BANNED: 'red' };
const STATUS_LABEL = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', BANNED: 'Baneado' };

function EditModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    title: product.title || '',
    description: product.description || '',
    price: product.price || '',
    stock: product.stock || '',
    categoryId: product.categoryId || '',
    images: product.images || [],
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.price) { toast.error('Título y precio son requeridos'); return; }
    setSaving(true);
    try {
      await productService.update(product.id, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
      });
      toast.success('Producto actualizado');
      onSave();
    } catch (e) { toast.error(e?.message || 'Error al actualizar'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <Card style={{ width: '100%', maxWidth: 520, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Editar Producto (Admin)</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Título *" value={form.title} onChange={set('title')} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Descripción
            </label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              style={{
                width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
              }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Precio ($) *" type="number" step="0.01" min="0.01" value={form.price} onChange={set('price')} />
            <Input label="Stock" type="number" min="0" value={form.stock} onChange={set('stock')} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Categoría
            </label>
            <select value={form.categoryId} onChange={set('categoryId')}
              style={{
                width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              }}>
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="URL de imagen" value={form.images?.[0] || ''}
            onChange={e => setForm(p => ({ ...p, images: [e.target.value] }))}
            placeholder="https://..." />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button onClick={handleSave} loading={saving} icon={<CheckCircle size={14} />}>
            Guardar cambios
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </Card>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editing, setEditing] = useState(null);

  const load = (kw = search, pg = page) => {
    setLoading(true);
    const params = { size: 15, page: pg };
    if (kw.trim()) params.keyword = kw.trim();
    productService.getAll(params)
      .then(r => {
        setProducts(r.data?.content || []);
        setTotalPages(r.data?.totalPages || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    categoryService.getAll().then(r => setCategories(r.data || []));
  }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(0); setSearch(keyword); load(keyword, 0); };

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto? Esta acción lo desactivará.')) return;
    try { await productService.remove(id); toast.success('Producto eliminado'); load(); }
    catch (e) { toast.error(e?.message || 'Error al eliminar'); }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Gestión de Productos</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Buscar productos..."
            style={{ width: '100%', padding: '10px 14px 10px 34px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <Button type="submit" size="sm">Buscar</Button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={36} /></div>
      ) : (
        <>
          <div className={styles.list}>
            {products.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No hay productos</p>}
            {products.map(p => (
              <Card key={p.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <p className={styles.name}>{p.title}</p>
                    <Badge color={STATUS_COLOR[p.status] || 'gray'}>{STATUS_LABEL[p.status] || p.status}</Badge>
                  </div>
                  <p className={styles.sub}>Vendedor: <strong>{p.sellerName}</strong> · {p.categoryName}</p>
                  <p className={styles.sub}>Precio: <strong>${p.price?.toFixed(2)}</strong> · Stock: {p.stock} · Vendidos: {p.totalSold} · Vistas: {p.viewCount?.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Button size="sm" variant="outline" icon={<Pencil size={12} />}
                    onClick={() => setEditing(p)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="danger" icon={<Trash2 size={12} />}
                    onClick={() => deleteProduct(p.id)}>
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1.5px solid', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    borderColor: i === page ? 'var(--b300)' : 'var(--border)',
                    background: i === page ? 'var(--b300)' : 'var(--card-bg)',
                    color: i === page ? '#fff' : 'var(--text-secondary)' }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <EditModal product={editing} categories={categories}
          onSave={() => { setEditing(null); load(); }}
          onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
