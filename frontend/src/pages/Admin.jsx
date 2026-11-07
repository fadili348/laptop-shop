import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const STATUSES = ["جديد", "تم الطلب", "تم الاتصال", "تم البيع", "ملغي"];


export default function Admin() {
  const [password, setPassword] = useState(() => localStorage.getItem("adminPw") || "");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (e) => {
    e?.preventDefault();
    try {
      const res = await axios.get(API_URL, { headers: { "x-admin-password": password } });
      setOrders(res.data);
      localStorage.setItem("adminPw", password);
      setError("");
    } catch (err) {
      setError(err.response?.status === 401 ? "كلمة السر غلط" : "ما قدرناش نحملو الطلبات. تأكد أن الخادم خدام.");
      if (err.response?.status === 401) {
        localStorage.removeItem("adminPw");
        setOrders(null);
      }
    }
  }, [password]);

  useEffect(() => {
    if (password && localStorage.getItem("adminPw") === password) load();
  }, [load, password]);

  useEffect(() => {
    if (!orders) return undefined;
    const interval = window.setInterval(() => load(), 10000);
    return () => window.clearInterval(interval);
  }, [load, orders]);

  const changeStatus = async (id, status) => {
    setError("");
    try {
      const res = await axios.patch(`${API_URL}/${id}`, { status }, { headers: { "x-admin-password": password } });
      setOrders((current) => current.map((order) => order._id === id ? res.data : order));
    } catch (err) {
      setError(err.response?.data?.message || "ما قدرناش نبدلو حالة الطلب");
    }
  };

  const remove = async (id) => {
    if (!confirm("واش متأكد بغيتي تمسح هاد الطلب؟")) return;
    setError("");
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { "x-admin-password": password } });
      setOrders((current) => current.filter((order) => order._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "ما قدرناش نمسحو الطلب");
    }
  };

  if (!orders) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-card" onSubmit={load}>
          <div className="admin-lock-icon" aria-hidden="true">🔒</div>
          <p className="admin-eyebrow">مساحة خاصة</p>
          <h1>لوحة الإدارة</h1>
          <p className="admin-login-description">دخل كلمة السر باش تشوف وتدبّر طلبات الزبناء.</p>
          <label htmlFor="admin-password">كلمة السر</label>
          <input
            id="admin-password"
            type="password"
            placeholder="كتب كلمة السر هنا"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">دخول للوحة الإدارة</button>
        </form>
      </div>
    );
  }

  const newOrders = orders.filter((order) => order.status === "جديد").length;
  const acceptedOrders = orders.filter((order) => order.status === "تم الطلب").length;
  const completedOrders = orders.filter((order) => order.status === "تم البيع").length;

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">إدارة المتجر</p>
            <h1>مرحبا بك 👋</h1>
            <p>هنا تقدر تشوف طلبات الزبناء وتحدّث حالتها.</p>
          </div>
          <button className="admin-refresh" type="button" onClick={() => load()}>
            <span aria-hidden="true">↻</span> تحديث الطلبات
          </button>
        </header>

        <section className="admin-stats" aria-label="ملخص الطلبات">
          <article className="admin-stat">
            <span className="admin-stat-icon">📦</span>
            <div><p>مجموع الطلبات</p><strong>{orders.length}</strong></div>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-icon is-new">✦</span>
            <div><p>طلبات جديدة</p><strong>{newOrders}</strong></div>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-icon is-accepted">✓</span>
            <div><p>تم تأكيدها</p><strong>{acceptedOrders}</strong></div>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-icon is-complete">★</span>
            <div><p>تم البيع</p><strong>{completedOrders}</strong></div>
          </article>
        </section>

        <section className="admin-orders-section">
          <div className="admin-section-heading">
            <div>
              <h2>طلبات الزبناء</h2>
              <p>{orders.length ? "الطلبات كتتحدّث تلقائياً كل 10 ثواني." : "ما كاين حتى طلب دابا."}</p>
            </div>
            <span className="admin-total-badge">{orders.length} طلب</span>
          </div>
          {error && <p className="error admin-error">{error}</p>}
          {orders.length === 0 ? (
            <div className="admin-empty">
              <span aria-hidden="true">🛍️</span>
              <h3>مازال ما توصّلنا حتى بطلب</h3>
              <p>أي طلب جديد من الموقع غادي يبان هنا.</p>
            </div>
          ) : (
            <div className="admin-orders">
              {orders.map((o) => (
                <article className="admin-order-card" key={o._id}>
                  <div className="admin-order-top">
                    <div className="admin-customer">
                      <span className="admin-avatar" aria-hidden="true">{o.fullName?.trim().charAt(0) || "ز"}</span>
                      <div>
                        <h3>{o.fullName}</h3>
                        <a href={`tel:${o.phone}`} dir="ltr">{o.phone}</a>
                      </div>
                    </div>
                    <span className={`admin-status ${o.status === "جديد" ? "status-new" : o.status === "تم الطلب" ? "status-accepted" : o.status === "تم البيع" ? "status-complete" : o.status === "ملغي" ? "status-cancelled" : "status-contacted"}`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <p><span>المدينة</span><strong>{o.city}</strong></p>
                    <p><span>العنوان</span><strong>{o.address}</strong></p>
                    <p><span>تاريخ الطلب</span><strong>{new Date(o.createdAt).toLocaleString("ar-MA")}</strong></p>
                  </div>

                  <div className="admin-order-actions">
                    <label>
                      <span>تغيير الحالة</span>
                      <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                    <button className="admin-delete" type="button" onClick={() => remove(o._id)}>حذف الطلب</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}