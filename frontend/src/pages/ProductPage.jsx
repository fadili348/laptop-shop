import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, PRODUCT } from "../config";

export default function ProductPage() {
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myOrder, setMyOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("myOrder") || "null");
    } catch {
      return null;
    }
  });
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(API_URL, form);
      const savedOrder = { id: res.data.id, token: res.data.token };
      localStorage.setItem("myOrder", JSON.stringify(savedOrder));
      setMyOrder(savedOrder);
      navigate(`/order/${savedOrder.id}?t=${encodeURIComponent(savedOrder.token)}`);
    } catch (err) {
      setError(err.response?.data?.message || "وقع مشكل، عاود حاول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storefront">
      <div className="storefront-shell">
        <header className="storefront-header">
          <a className="storefront-brand" href="/" aria-label="الرئيسية">
            <span className="storefront-brand-icon">م</span>
            <span>متجر الحاسوب</span>
          </a>
          <span className="storefront-delivery">الدفع عند التسليم</span>
        </header>

        <main>
          <section className="product-layout">
            <div className="product-gallery">
              <div className="product-image-frame">
                <img className="product-main-image" src={PRODUCT.images[img]} alt={PRODUCT.name} />
                <span className="product-condition">{PRODUCT.condition}</span>
              </div>
              <div className="product-thumbnails" aria-label="صور الحاسوب">
                {PRODUCT.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    aria-label={`عرض الصورة ${i + 1}`}
                    aria-pressed={i === img}
                    className={`product-thumbnail ${i === img ? "active" : ""}`}
                    onClick={() => setImg(i)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            </div>

            <div className="product-info">
              <p className="product-eyebrow">حاسوب مكتبي</p>
              <h1>{PRODUCT.name}</h1>
              <p className="product-description">حاسوب عملي للاستعمال اليومي، الخدمة والدراسة.</p>
              <div className="product-price-box">
                <span>الثمن</span>
                <strong>{PRODUCT.price} <small>درهم</small></strong>
              </div>
              <a className="product-order-link" href="#order">طلب الحاسوب <span aria-hidden="true">←</span></a>
              <div className="product-specs">
                <h2>مواصفات الحاسوب</h2>
                <table>
                  <tbody>
                    {PRODUCT.specs.map(([k, v]) => (
                      <tr key={k}>
                        <th>{k}</th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="order-panel" id="order">
            <div className="order-panel-intro">
              <span className="order-step">طلب سهل وآمن</span>
              <h2>طلب الحاسوب</h2>
              <p>دخل معلوماتك وغادي نتاصلو بيك باش نأكدو الطلب. ما كاينش الأداء حتى يوصلك الحاسوب.</p>
              {myOrder && (
                <Link className="order-track-link" to={`/order/${myOrder.id}?t=${encodeURIComponent(myOrder.token)}`}>
                  عندك طلب سابق؟ تتبّعو من هنا
                </Link>
              )}
            </div>

            <form className="order-form" onSubmit={onSubmit}>
              <div className="order-form-grid">
                <label className="order-field">
                  <span>الاسم الكامل</span>
                  <input name="fullName" placeholder="مثال: محمد العلوي" value={form.fullName} onChange={onChange} autoComplete="name" required />
                </label>
                <label className="order-field">
                  <span>رقم الهاتف</span>
                  <input name="phone" type="tel" placeholder="0612345678" value={form.phone} onChange={onChange} autoComplete="tel" inputMode="tel" required />
                </label>
                <label className="order-field">
                  <span>المدينة</span>
                  <input name="city" placeholder="المدينة ديالك" value={form.city} onChange={onChange} autoComplete="address-level2" required />
                </label>
                <label className="order-field order-field-full">
                  <span>العنوان بالتفصيل</span>
                  <input name="address" placeholder="الحي، الزنقة، رقم الدار..." value={form.address} onChange={onChange} autoComplete="street-address" required />
                </label>
              </div>

              {error && <p className="error order-form-error" role="alert">{error}</p>}
              <button className="order-submit" type="submit" disabled={loading}>
                {loading ? "كنسجلو الطلب..." : "أكد الطلب"}
              </button>
              <p className="order-form-note">🔒 معلوماتك كتستعمل غير باش نأكدو ونسلمو الطلب.</p>
            </form>
          </section>
        </main>

        <footer className="storefront-footer">
          <span>عندك سؤال على الحاسوب؟</span>
          <a
            href={`https://wa.me/${PRODUCT.whatsapp}?text=${encodeURIComponent("السلام، بغيت نسول على الحاسوب")}`}
            target="_blank"
            rel="noreferrer"
          >
            تواصل معنا عبر واتساب
          </a>
        </footer>
      </div>
    </div>
  );
}