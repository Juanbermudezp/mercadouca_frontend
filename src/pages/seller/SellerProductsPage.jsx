import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/products/productService';
import { categoryService } from '../../services/categories/categoryService';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Spinner, Empty } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './SellerPage.module.css';

const EMPTY_FORM = { title:'', description:'', price:'', stock:'', categoryId:'', images:[] };
const STATUS_COLOR = { ACTIVE:'green', INACTIVE:'gray', BANNED:'red' };

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    productService.getBySeller(user.userId || user.id, { size:50 })
      .then(r => setProducts(r.data?.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    categoryService.getAll().then(r => setCategories(r.data || []));
  }, []);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ title: p.title, description: p.description || '', price: p.price, stock: p.stock, categoryId: p.categoryId, images: p.images || [] });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.price || !form.stock || !form.categoryId) { toast.error('Completa los campos requeridos'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), categoryId: parseInt(form.categoryId) };
      if (editing) { await productService.update(editing, payload); toast.success('Producto actualizado'); }
      else { await productService.create(payload); toast.success('Producto creado'); }
      setShowForm(false); setEditing(null); setForm(EMPTY_FORM); load();
    } catch (e) { toast.error(e?.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return;
    await productService.remove(id); toast.success('Producto desactivado'); load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Mis Productos</h1><p className={styles.sub}>{products.length} productos publicados</p></div>
        <Button icon={<Plus size={15}/>} onClick={openCreate}>Nuevo Producto</Button>
      </div>

      {showForm && (
        <Card className={styles.formCard}>
          <h3 className={styles.formTitle}>{editing ? '✏️ Editar' : '➕ Nuevo'} Producto</h3>
          <div className={styles.formGrid}>
            <div className={styles.span2}><Input label="Título" value={form.title} onChange={set('title')} required placeholder="Nombre del producto"/></div>
            <div className={styles.span2}>
              <label className={styles.label}>Descripción</label>
              <textarea className={styles.textarea} value={form.description} onChange={set('description')} rows={3} placeholder="Describe el producto..."/>
            </div>
            <Input label="Precio ($)" type="number" step="0.01" min="0.01" value={form.price} onChange={set('price')} required />
            <Input label="Stock disponible" type="number" min="0" value={form.stock} onChange={set('stock')} required />
            <div>
              <label className={styles.label}>Categoría *</label>
              <select className={styles.select} value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Seleccionar categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="URL de imagen" value={form.images?.[0] || ''} onChange={e => setForm(p => ({ ...p, images: [e.target.value] }))} placeholder="https://..." />
          </div>
          <div className={styles.formActions}>
            <Button onClick={save} loading={saving}>{editing ? 'Actualizar' : 'Crear Producto'}</Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className={styles.center}><Spinner size={36}/></div>
      ) : products.length === 0 ? (
        <Empty icon={<Package size={48}/>} title="Sin productos" subtitle="Crea tu primer producto y empieza a vender" action={<Button onClick={openCreate} icon={<Plus size={15}/>}>Crear producto</Button>}/>
      ) : (
        <div className={styles.list}>
          {products.map(p => (
            <Card key={p.id} className={styles.row}>
              <img src={p.images?.[0] || `https://placehold.co/60x60/e6f0ff/0065ff?text=P`} alt={p.title} className={styles.rowImg}/>
              <div className={styles.rowInfo}>
                <div className={styles.rowTitleRow}>
                  <p className={styles.rowTitle}>{p.title}</p>
                  <Badge color={STATUS_COLOR[p.status] || 'gray'}>{p.status}</Badge>
                </div>
                <p className={styles.rowSub}>{p.categoryName} • Stock: {p.stock} • {p.totalSold} vendidos</p>
              </div>
              <p className={styles.rowPrice}>${p.price?.toFixed(2)}</p>
              <div className={styles.rowActions}>
                <Button size="sm" variant="ghost" icon={<Pencil size={13}/>} onClick={() => openEdit(p)}>Editar</Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={13}/>} onClick={() => del(p.id)}>Quitar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
