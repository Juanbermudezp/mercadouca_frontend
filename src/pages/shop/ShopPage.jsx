import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { productService } from '../../services/products/productService';
import { categoryService } from '../../services/categories/categoryService';
import ProductCard from '../../components/product/ProductCard';
import { SkeletonCard, Empty } from '../../components/common/UI';
import ProductFilters from '../../components/product/ProductFilters';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    keyword: params.get('keyword') || '',
    categoryId: '', minPrice: '', maxPrice: '',
    featured: false, sortBy: 'createdAt', sortDir: 'desc', page: 0,
  });

  useEffect(() => { categoryService.getAll().then(r => setCategories(r.data || [])); }, []);

  // Sincronizar keyword cuando el Navbar navega a /shop?keyword=...
  useEffect(() => {
    const kw = params.get('keyword') || '';
    setFilters(p => ({ ...p, keyword: kw, page: 0 }));
  }, [params]);

  useEffect(() => {
    setLoading(true);
    const query = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== '' && v !== false));
    productService.getAll({ ...query, size: 20 })
      .then(r => { setProducts(r.data?.content || []); setPagination({ page: r.data?.page, totalPages: r.data?.totalPages, totalElements: r.data?.totalElements }); })
      .finally(() => setLoading(false));
  }, [filters]);

  const featuredProducts = products.filter(p => p.featured);
  const regularProducts = products.filter(p => !p.featured);

  return (
    <div className={styles.page}>
      <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
        <ProductFilters filters={filters} onChange={setFilters} categories={categories} onClose={() => setShowFilters(false)} />
      </aside>
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <button
            className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={16} /> Filtros
          </button>
          {filters.keyword && <div className={styles.chip}>{filters.keyword} <button onClick={() => setFilters(p => ({...p, keyword:''}))}><X size={12}/></button></div>}
          <span className={styles.count}>{pagination.totalElements} productos</span>
        </div>
        {loading ? (
          <div className={styles.grid}>{Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : products.length === 0 ? (
          <Empty icon="🔍" title="Sin resultados" subtitle="Intenta con otros filtros" />
        ) : (
          <>
            {featuredProducts.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Productos Destacados!</h2>
                <div className={`${styles.grid} ${styles.featured}`}>
                  {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}
            <section className={styles.section}>
              {regularProducts.length > 0 && <div className={styles.grid}>{regularProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>}
            </section>
            {pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button key={i} className={`${styles.pageBtn} ${i === pagination.page ? styles.pageBtnActive : ''}`} onClick={() => setFilters(p => ({...p, page: i}))}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
