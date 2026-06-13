import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Tag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orders/orderService';
import { addressService } from '../../services/addresses/addressService';
import { shippingService } from '../../services/shipping/shippingService';
import { couponService } from '../../services/coupons/couponService';
import { useCart } from '../../context/CartContext';
import { Card, Spinner } from '../../components/common/UI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AddressSelector from './AddressSelector';
import { PAYMENT_METHODS, SHIPPING_PROVIDERS } from '../../constants';
import styles from './CheckoutPage.module.css';

const STEPS = ['Dirección', 'Envío', 'Pago', 'Confirmar'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [couponResult, setCouponResult] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [pendingNewAddr, setPendingNewAddr] = useState(null);

  const [form, setForm] = useState({
    shippingAddress: '', shippingCity: '', shippingCountry: 'El Salvador',
    shippingZip: '', shippingProvider: '', paymentMethod: '',
    paymentToken: 'tok_test', couponCode: '', notes: '',
  });

  useEffect(() => {
    addressService.getAll().then(r => {
      const addrs = r.data || [];
      setAddresses(addrs);
      const def = addrs.find(a => a.defaultAddress) || addrs[0];
      if (def) handleAddressSelect({ street: def.street, city: def.city, country: def.country, zipCode: def.zipCode || '', id: def.id }, false);
    });
  }, []);

  const handleAddressSelect = (addrData, isNew) => {
    setSelectedAddrId(addrData.id || null);
    setPendingNewAddr(isNew ? addrData.newAddrData : null);
    setForm(p => ({
      ...p,
      shippingAddress: addrData.street,
      shippingCity: addrData.city,
      shippingCountry: addrData.country || 'El Salvador',
      shippingZip: addrData.zipCode || '',
    }));
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const loadQuotes = async () => {
    if (!form.shippingCity || !form.shippingAddress) { toast.error('Completa la dirección primero'); return; }
    setLoadingQuotes(true);
    try {
      const res = await shippingService.getQuotes({ destinationCity: form.shippingCity, destinationCountry: form.shippingCountry, destinationZip: form.shippingZip, weightKg: 1 });
      setQuotes(res.data || []);
    } catch { /* continuar sin cotización */ }
    finally { setLoadingQuotes(false); setStep(2); }
  };

  const validateCoupon = async () => {
    if (!form.couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponService.validate({ code: form.couponCode.trim(), orderAmount: cart?.total });
      if (res.data?.valid) { setCouponResult(res.data); toast.success('Cupón aplicado ✅'); }
      else { toast.error('Cupón inválido o expirado'); setCouponResult(null); }
    } catch { toast.error('Cupón no encontrado'); setCouponResult(null); }
    finally { setCouponLoading(false); }
  };

  const placeOrder = async () => {
    if (!form.shippingProvider) { toast.error('Selecciona un método de envío'); return; }
    if (!form.paymentMethod) { toast.error('Selecciona un método de pago'); return; }
    setPlacing(true);
    try {
      if (pendingNewAddr) await addressService.create(pendingNewAddr).catch(() => {});
      const res = await orderService.create(form);
      await fetchCart();
      toast.success('¡Orden creada exitosamente!');
      navigate(`/orders/${res.data.id}`);
    } catch (e) { toast.error(e?.message || 'Error al procesar la orden'); }
    finally { setPlacing(false); }
  };

  const discount = couponResult ? (couponResult.discountType === 'PERCENTAGE' ? (cart?.total || 0) * couponResult.discountValue / 100 : couponResult.discountValue) : 0;
  const shippingCost = quotes.find(q => q.provider === form.shippingProvider)?.cost || 0;
  const finalTotal = (cart?.total || 0) - discount + shippingCost;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Finalizar Compra</h1>

      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <div key={s} className={`${styles.stepItem} ${i+1<=step?styles.stepActive:''} ${i+1<step?styles.stepDone:''}`}>
            <div className={styles.stepDot}>{i+1<step?<CheckCircle size={14}/>:i+1}</div>
            <span>{s}</span>
            {i<STEPS.length-1&&<div className={`${styles.stepLine} ${i+1<step?styles.stepLineDone:''}`}/>}
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          {step === 1 && (
            <Card className={styles.card}>
              <AddressSelector addresses={addresses} selectedId={selectedAddrId} onSelect={handleAddressSelect} />
              <Button onClick={loadQuotes} loading={loadingQuotes} disabled={!form.shippingAddress} icon={<Truck size={15}/>} style={{ marginTop: 16 }}>
                Ver opciones de envío →
              </Button>
            </Card>
          )}

          {step === 2 && (
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}><Truck size={16}/> Método de envío</h3>
              <div className={styles.optionList}>
                {(quotes.length > 0 ? quotes.map(q => ({ value: q.provider, label: `${q.provider} — ${q.serviceType}`, sub: `${q.estimatedDays} días`, price: `$${q.cost?.toFixed(2)}` })) : SHIPPING_PROVIDERS.map(p => ({ value: p.value, label: p.label }))).map(opt => (
                  <button key={opt.value} className={`${styles.optionBtn} ${form.shippingProvider===opt.value?styles.optionActive:''}`} onClick={() => setForm(p => ({...p, shippingProvider: opt.value}))}>
                    <div><p className={styles.optionTitle}>{opt.label}</p>{opt.sub&&<p className={styles.optionSub}>{opt.sub}</p>}</div>
                    {opt.price&&<p className={styles.optionPrice}>{opt.price}</p>}
                  </button>
                ))}
              </div>
              <div className={styles.stepNav}>
                <Button variant="ghost" onClick={() => setStep(1)}>← Atrás</Button>
                <Button onClick={() => setStep(3)} disabled={!form.shippingProvider}>Continuar →</Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}><CreditCard size={16}/> Método de pago</h3>
              <div className={styles.optionList}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value} className={`${styles.optionBtn} ${form.paymentMethod===m.value?styles.optionActive:''}`} onClick={() => setForm(p => ({...p, paymentMethod: m.value}))}>
                    <p className={styles.optionTitle}>{m.label}</p>
                  </button>
                ))}
              </div>
              <div className={styles.couponRow}>
                <Input label="Cupón (opcional)" value={form.couponCode} onChange={set('couponCode')} placeholder="DESCUENTO10" />
                <Button size="sm" variant="outline" onClick={validateCoupon} loading={couponLoading} icon={<Tag size={13}/>} style={{ alignSelf: 'flex-end' }}>Aplicar</Button>
              </div>
              {couponResult && <p className={styles.couponOk}>✅ {couponResult.discountType==='PERCENTAGE'?`${couponResult.discountValue}%`:`$${couponResult.discountValue}`} de descuento</p>}
              <div style={{ marginTop: 12 }}>
                <label className={styles.noteLabel}>Notas (opcional)</label>
                <textarea className={styles.noteArea} value={form.notes} onChange={set('notes')} rows={2} placeholder="Instrucciones especiales..." />
              </div>
              <div className={styles.stepNav}>
                <Button variant="ghost" onClick={() => setStep(2)}>← Atrás</Button>
                <Button onClick={() => setStep(4)} disabled={!form.paymentMethod}>Revisar →</Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}><CheckCircle size={16}/> Confirmar orden</h3>
              <div className={styles.confirmRow}><span>Dirección</span><strong>{form.shippingAddress}, {form.shippingCity}</strong></div>
              <div className={styles.confirmRow}><span>Envío</span><strong>{form.shippingProvider}</strong></div>
              <div className={styles.confirmRow}><span>Pago</span><strong>{form.paymentMethod}</strong></div>
              {form.couponCode&&<div className={styles.confirmRow}><span>Cupón</span><strong>{form.couponCode}</strong></div>}
              {pendingNewAddr&&<div className={styles.confirmRow}><span>Dirección</span><strong>Nueva — se guardará automáticamente</strong></div>}
              <div className={styles.stepNav}>
                <Button variant="ghost" onClick={() => setStep(3)}>← Atrás</Button>
                <Button onClick={placeOrder} loading={placing} size="lg">✅ Confirmar y Pagar</Button>
              </div>
            </Card>
          )}
        </div>

        <Card className={styles.summary}>
          <h3 className={styles.summaryTitle}>Resumen del pedido</h3>
          {cart?.items?.map(item => (
            <div key={item.id} className={styles.summaryItem}>
              <span className={styles.summaryItemName}>{item.productTitle} x{item.quantity}</span>
              <span>${item.subtotal?.toFixed(2)}</span>
            </div>
          ))}
          <div className={styles.summaryDivider}/>
          <div className={styles.summaryRow}><span>Subtotal</span><span>${cart?.total?.toFixed(2)}</span></div>
          {discount>0&&<div className={styles.summaryRow} style={{color:'var(--success)'}}><span>Descuento</span><span>-${discount.toFixed(2)}</span></div>}
          {shippingCost>0&&<div className={styles.summaryRow}><span>Envío</span><span>${shippingCost.toFixed(2)}</span></div>}
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
        </Card>
      </div>
    </div>
  );
}
