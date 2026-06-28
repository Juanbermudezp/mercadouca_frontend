import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/categories/categoryService';
import { Card, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './AdminPage.module.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:'', description:'', imageUrl:'', parentId:'' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => categoryService.getAll().then(r => setCategories(r.data||[])).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (editing) { await categoryService.update(editing, form); toast.success('Categoría actualizada'); }
      else { await categoryService.create(form); toast.success('Categoría creada'); }
      setForm({ name:'', description:'', imageUrl:'', parentId:'' }); setEditing(null); load();
    } catch(e) { toast.error(e?.message||'Error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try { await categoryService.remove(id); toast.success('Categoría eliminada'); load(); }
    catch (e) { toast.error(e?.message || 'Error al eliminar'); }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Categorías</h1>
      <Card style={{ padding:20, marginBottom:16 }}>
        <h3 style={{ marginBottom:14, fontSize:15, fontWeight:600 }}>{editing ? 'Editar' : 'Nueva'} Categoría</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Nombre" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required />
          <Input label="Descripción" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
          <Input label="URL de imagen" value={form.imageUrl} onChange={e=>setForm(p=>({...p,imageUrl:e.target.value}))} />
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Categoría padre</label>
            <select style={{ width:'100%', padding:'10px 14px', background:'var(--bg-secondary)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:14, outline:'none' }}
              value={form.parentId} onChange={e=>setForm(p=>({...p,parentId:e.target.value}))}>
              <option value="">Sin padre (raíz)</option>
              {categories.filter(c=>!c.parentId).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop:14, display:'flex', gap:8 }}>
          <Button onClick={save} loading={saving} icon={<Plus size={15}/>}>{editing ? 'Actualizar' : 'Crear'}</Button>
          {editing && <Button variant="ghost" onClick={()=>{setEditing(null);setForm({name:'',description:'',imageUrl:'',parentId:''});}}>Cancelar</Button>}
        </div>
      </Card>
      {loading ? <Spinner/> : (
        <div className={styles.list}>
          {categories.map(cat => (
            <Card key={cat.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <p className={styles.name}>{cat.name}</p>
                <p className={styles.sub}>{cat.description || 'Sin descripción'} {cat.parentName ? `• Sub de: ${cat.parentName}` : '• Raíz'}</p>
              </div>
              <div className={styles.cardActions}>
                <Button size="sm" variant="ghost" icon={<Pencil size={13}/>} onClick={()=>{setEditing(cat.id);setForm({name:cat.name,description:cat.description||'',imageUrl:cat.imageUrl||'',parentId:cat.parentId||''});}}>Editar</Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={13}/>} onClick={()=>del(cat.id)}>Eliminar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
