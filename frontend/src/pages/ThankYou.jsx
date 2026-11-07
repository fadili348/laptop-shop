import { Link } from "react-router-dom";

export default function ThankYou() {
  let order = null;
  try { order = JSON.parse(localStorage.getItem("myOrder")); } catch { }

  return (
    <div className="container center">
      <div className="card">
        <div className="big">✅</div>
        <h1>شكرا ليك!</h1>
        <p>توصلنا بالطلب ديالك، وغادي نتصلو بيك فأقرب وقت.</p>
        {order && (
          <Link className="btn" to={`/order/${order.id}?t=${order.token}`}>
            شوف معلومات الطلب ديالي
          </Link>
        )}
        <p><Link to="/">الرجوع للصفحة الرئيسية</Link></p>
      </div>
    </div>
  );
}