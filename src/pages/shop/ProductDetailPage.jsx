import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, MessageCircle, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/products/productService';
import { reviewService } from '../../services/reviews/reviewService';
import { questionService } from '../../services/questions/questionService';
import { wishlistService } from '../../services/wishlist/wishlistService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Stars, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import styles from './ProductDetailPage.module.css';

function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!comment.trim()) { toast.error('Escribe un comentario'); return; }
    setSaving(true);
    try {
      await reviewService.create({ productId: parseInt(productId), rating, comment });
      toast.success('Resena publicada');
      setComment(''); setRating(5); onSubmitted();
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };
  return (
    <Card className={styles.reviewCard} style={{ marginBottom:12 }}>
      <p style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Escribe una resena</p>
      <div style={{ display:'flex', gap:4, marginBottom:10 }}>
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => setRating(s)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:22,
              color: s <= rating ? '#f59e0b' : 'var(--border)' }}>*</button>
        ))}
        <span style={{ fontSize:13, color:'var(--text-muted)', alignSelf:'center' }}>{rating}/5</span>
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
        placeholder="Comparte tu experiencia..."
        style={{ width:'100%', padding:'10px 14px', background:'var(--bg-secondary)',
          border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
          color:'var(--text-primary)', fontSize:14, outline:'none', resize:'vertical',
          fontFamily:'var(--font-body)', boxSizing:'border-box' }}/>
      <Button size="sm" onClick={submit} loading={saving} style={{ marginTop:8 }}>Publicar resena</Button>
    </Card>
  );
}

function SellerResponseForm({ reviewId, onSubmitted }) {
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!response.trim()) return;
    setSaving(true);
    try {
      await reviewService.addSellerResponse(reviewId, { response });
      toast.success('Respuesta publicada'); onSubmitted();
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ marginTop:8 }}>
      <textarea value={response} onChange={e => setResponse(e.target.value)} rows={2}
        placeholder="Tu respuesta como vendedor..."
        style={{ width:'100%', padding:'8px 12px', background:'var(--bg-secondary)',
          border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
          color:'var(--text-primary)', fontSize:13, outline:'none', resize:'vertical',
          fontFamily:'var(--font-body)', boxSizing:'border-box' }}/>
      <Button size="sm" variant="outline" onClick={submit} loading={saving} style={{ marginTop:6 }}>Responder</Button>
    </div>
  );
}

function AnswerQuestionForm({ questionId, onSubmitted }) {
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      await questionService.answer(questionId, { answer });
      toast.success('Respuesta publicada');
      onSubmitted();
    } catch (e) { toast.error(e?.message || 'Error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ marginTop:8 }}>
      <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={2}
        placeholder="Escribe tu respuesta como vendedor..."
        style={{ width:'100%', padding:'8px 12px', background:'var(--bg-secondary)',
          border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
          color:'var(--text-primary)', fontSize:13, outline:'none', resize:'vertical',
          fontFamily:'var(--font-body)', boxSizing:'border-box' }}/>
      <Button size="sm" variant="outline" onClick={submit} loading={saving} style={{ marginTop:6 }}>Responder pregunta</Button>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart() || {};
  const { user, canBuy, isBuyer, isSeller } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [tab, setTab] = useState('reviews');
  const [askText, setAskText] = useState('');
  const [askingQ, setAskingQ] = useState(false);
  const [answeringId, setAnsweringId] = useState(null);

  const loadData = () => Promise.all([
    productService.getById(id),
    reviewService.getByProduct(id, { size: 10 }),
    questionService.getByProduct(id, { size: 10 }),
  ]).then(([p, r, q]) => {
    setProduct(p.data);
    setReviews(r.data?.content || []);
    setQuestions(q.data?.content || []);
  });

  useEffect(() => {
    setLoading(true);
    const tasks = [loadData()];
    if (canBuy()) tasks.push(wishlistService.check(id).then(r => setInWishlist(r.data?.inWishlist || false)).catch(() => {}));
    Promise.all(tasks).finally(() => setLoading(false));
  }, [id]);

  const toggleWishlist = async () => {
    try {
      if (inWishlist) { await wishlistService.remove(id); setInWishlist(false); toast.success('Eliminado de favoritos'); }
      else { await wishlistService.add(id); setInWishlist(true); toast.success('Agregado a favoritos'); }
    } catch (e) { toast.error(e?.message || 'Error'); }
  };

  const handleAddToCart = async () => {
    if (!canBuy()) { toast.error('Debes iniciar sesión para comprar'); return; }
    setAdding(true);
    try { await addItem(product.id, qty); toast.success('Agregado al carrito'); }
    catch (e) { toast.error(e?.message || 'Error'); }
    finally { setAdding(false); }
  };

  const handleBuyNow = async () => { await handleAddToCart(); navigate('/checkout'); };

  const submitQuestion = async () => {
    if (!askText.trim()) return;
    setAskingQ(true);
    try { await questionService.ask(id, { question: askText }); toast.success('Pregunta enviada'); setAskText(''); await loadData(); }
    catch (e) { toast.error(e?.message || 'Error'); }
    finally { setAskingQ(false); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={40}/></div>;
  if (!product) return <p>Producto no encontrado</p>;

  const img = product.images?.[0] || 'https://placehold.co/400x350/e6f0ff/0065ff?text=Producto';
  const isMyProduct = isSeller() && product.sellerId === (user?.userId || user?.id);

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <Card className={styles.imgCard}><img src={img} alt={product.title} className={styles.img}/></Card>
        <div className={styles.info}>
          <p className={styles.category}>{product.categoryName}</p>
          <h1 className={styles.title}>{product.title}</h1>
          <div className={styles.ratingRow}>
            <Stars rating={product.averageRating}/>
            <span className={styles.ratingText}>({product.totalReviews} Resenas)</span>
          </div>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price?.toFixed(2)}</span>
            {product.originalPrice > product.price && <span className={styles.original}>${product.originalPrice?.toFixed(2)}</span>}
          </div>
          <p className={styles.stock}>Disponibles: <strong>{product.stock}</strong></p>
          <div className={styles.qtyRow}>
            <div className={styles.qtyControl}>
              <button onClick={() => setQty(q => Math.max(1, q-1))} className={styles.qtyBtn}><Minus size={14}/></button>
              <span className={styles.qty}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q+1))} className={styles.qtyBtn}><Plus size={14}/></button>
            </div>
            <Button onClick={handleAddToCart} loading={adding} icon={<ShoppingCart size={16}/>} size="lg">Al Carrito</Button>
            <Button onClick={handleBuyNow} variant="danger" size="lg">Comprar Ya</Button>
            {canBuy() && (
              <button onClick={toggleWishlist} title={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                style={{ background:'none', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
                  padding:'8px 12px', cursor:'pointer', color: inWishlist ? '#ef4444' : 'var(--text-muted)', display:'flex', alignItems:'center' }}>
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'}/>
              </button>
            )}
          </div>
          <p className={styles.seller}>Vendedor: <strong>{product.sellerName}</strong></p>
        </div>
      </div>

      <div className={styles.tabs}>
        {['reviews','questions'].map(t => (
          <button key={t} className={styles.tab + ' ' + (tab === t ? styles.tabActive : '')} onClick={() => setTab(t)}>
            {t === 'reviews' ? 'Resenas (' + reviews.length + ')' : 'Preguntas (' + questions.length + ')'}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div className={styles.list}>
          {canBuy() && !isMyProduct && <ReviewForm productId={id} onSubmitted={loadData}/>}
          {reviews.length === 0
            ? <p className={styles.empty}>Aun no hay resenas</p>
            : reviews.map(r => (
              <Card key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}><strong>{r.buyerName}</strong><Stars rating={r.rating}/></div>
                <p className={styles.reviewText}>{r.comment}</p>
                {r.sellerResponse
                  ? <p className={styles.sellerResp}><strong>Vendedor:</strong> {r.sellerResponse}</p>
                  : isMyProduct && (
                    answeringId === r.id
                      ? <SellerResponseForm reviewId={r.id} onSubmitted={() => { setAnsweringId(null); loadData(); }}/>
                      : <button onClick={() => setAnsweringId(r.id)} style={{ fontSize:12, color:'var(--b300)', background:'none', border:'none', cursor:'pointer', marginTop:6 }}>Responder resena</button>
                  )
                }
              </Card>
            ))
          }
        </div>
      )}

      {tab === 'questions' && (
        <div className={styles.list}>
          {canBuy() && (
            <Card className={styles.reviewCard} style={{ marginBottom:12 }}>
              <p style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Hacer una pregunta</p>
              <textarea value={askText} onChange={e => setAskText(e.target.value)} rows={2}
                placeholder="Tienes alguna duda sobre este producto?"
                style={{ width:'100%', padding:'10px 14px', background:'var(--bg-secondary)',
                  border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
                  color:'var(--text-primary)', fontSize:14, outline:'none', resize:'vertical',
                  fontFamily:'var(--font-body)', boxSizing:'border-box' }}/>
              <Button size="sm" onClick={submitQuestion} loading={askingQ} style={{ marginTop:8 }}>Enviar pregunta</Button>
            </Card>
          )}
          {questions.length === 0
            ? <p className={styles.empty}>Aun no hay preguntas</p>
            : questions.map(q => (
              <Card key={q.id} className={styles.reviewCard}>
                <p className={styles.question}><MessageCircle size={14}/> {q.question}</p>
                {q.answered
                  ? <p className={styles.answer}>✅ {q.answer}</p>
                  : isMyProduct
                    ? <AnswerQuestionForm questionId={q.id} onSubmitted={loadData}/>
                    : <p className={styles.pending}>Sin respuesta aún</p>
                }
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
