import { X } from 'lucide-react';
import styles from './ProductFilters.module.css';

const PRICE_RANGES = [
  { label: '$0 - $50', min: 0, max: 50 },
  { label: '$50 - $75', min: 50, max: 75 },
  { label: '$75 - $150', min: 75, max: 150 },
  { label: '$150 - $200', min: 150, max: 200 },
  { label: 'Más de $200', min: 200, max: '' },
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'averageRating-desc', label: 'Mejor valorados' },
  { value: 'totalSold-desc', label: 'Más vendidos' },
];

export default function ProductFilters({ filters, onChange, categories, onClose }) {
  const set = (k, v) => onChange(p => ({ ...p, [k]: v, page: 0 }));

  const setPriceRange = (range) => onChange(p => ({ ...p, minPrice: range.min, maxPrice: range.max, page: 0 }));
  const clearAll = () => onChange({ keyword: '', categoryId: '', minPrice: '', maxPrice: '', featured: false, sortBy: 'createdAt', sortDir: 'desc', page: 0 });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>🎚️ Filtros</span>
        <div className={styles.actions}>
          <button className={styles.clear} onClick={clearAll}>Limpiar Todo</button>
          {onClose && <button className={styles.close} onClick={onClose}><X size={16}/></button>}
        </div>
      </div>
      <section className={styles.section}>
        <h4 className={styles.label}>Categoría</h4>
        {categories.map(cat => (
          <label key={cat.id} className={styles.checkRow}>
            <input type="checkbox" checked={filters.categoryId == cat.id} onChange={e => set('categoryId', e.target.checked ? cat.id : '')} />
            {cat.name}
          </label>
        ))}
      </section>
      <section className={styles.section}>
        <h4 className={styles.label}>Precio</h4>
        {PRICE_RANGES.map(r => (
          <label key={r.label} className={styles.checkRow}>
            <input type="checkbox" checked={filters.minPrice == r.min && filters.maxPrice == r.max} onChange={() => setPriceRange(r)} />
            {r.label}
          </label>
        ))}
      </section>
      <section className={styles.section}>
        <h4 className={styles.label}>Ordenar por</h4>
        <select className={styles.select} value={`${filters.sortBy}-${filters.sortDir}`}
          onChange={e => { const [by, dir] = e.target.value.split('-'); onChange(p => ({...p, sortBy: by, sortDir: dir})); }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </section>
      <label className={styles.checkRow}>
        <input type="checkbox" checked={filters.featured} onChange={e => set('featured', e.target.checked)} />
        Solo destacados
      </label>
    </div>
  );
}
