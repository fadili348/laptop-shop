import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

export default function MyOrder() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const token = params.get("t") || "";
    const headers = { "x-edit-token": token };

    const [form, setForm] = useState(null);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(null);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let active = true;
        const loadOrder = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/mine/${id}`, {
                    headers: { "x-edit-token": token },
                });
                if (active) {
                    setForm((current) => current ? { ...current, status: data.status } : data);
                    setNotFound(false);
                    setError("");
                }
            } catch (err) {
                if (!active) return;
                if (err.response?.status === 404) setNotFound(true);
                else setError("ما قدرناش نتصلو بالسيرفر. عاود حاول من بعد.");
            }
        };
        loadOrder();
        const interval = window.setInterval(loadOrder, 15000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [id, token]);

    const onChange = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

    const save = async (e) => {
        e.preventDefault();
        setMsg(""); setError("");
        try {
            const r = await axios.put(`${API_URL}/mine/${id}`, draft, { headers });
            setForm(r.data);
            setDraft(null);
            setEditing(false);
            setMsg("تم حفظ التعديلات ✅");
        } catch (err) {
            setError(err.response?.data?.message || "وقع مشكل");
        }
    };

    if (notFound) return <div className="container center"><div className="card"><h1>الرابط غير صحيح</h1></div></div>;
    if (!form) return <div className="container center"><div><p>جاري تحميل الطلب...</p>{error && <p className="error">{error}</p>}</div></div>;

    const editable = form.status === "جديد";
    const orderFields = [
        ["الاسم الكامل", "fullName"],
        ["رقم الهاتف", "phone"],
        ["المدينة", "city"],
        ["العنوان", "address"],
    ];

    return (
        <div className="container">
            <div className="card">
                <h1>الطلب ديالي</h1>
                <p className="hint">حالة الطلب: <b>{form.status}</b></p>
                {error && <p className="error">{error}</p>}
                {!editable && <p className="hint">ما بقاش ممكن تعدل هاد الطلب.</p>}
                {!editing ? (
                    <>
                        <div className="order-details">
                            {orderFields.map(([label, field]) => (
                                <p key={field}><b>{label}:</b> {form[field] || "—"}</p>
                            ))}
                        </div>
                        {editable && (
                            <button type="button" onClick={() => {
                                setDraft({ ...form });
                                setEditing(true);
                            }}>تعديل المعلومات</button>
                        )}
                    </>
                ) : (
                    <form onSubmit={save}>
                        <input name="fullName" value={draft.fullName} onChange={onChange} required />
                        <input name="phone" value={draft.phone} onChange={onChange} required inputMode="tel" />
                        <input name="city" value={draft.city} onChange={onChange} required />
                        <input name="address" value={draft.address} onChange={onChange} required />
                        <button type="submit">حفظ التعديلات</button>
                        <button type="button" onClick={() => {
                            setDraft(null);
                            setEditing(false);
                        }}>إلغاء</button>
                    </form>
                )}
                {msg && <p className="ok">{msg}</p>}
                <p><Link to="/">الرجوع للصفحة الرئيسية</Link></p>
            </div>
        </div>
    );
}