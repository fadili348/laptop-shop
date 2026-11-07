const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const router = express.Router();

const checkAdmin = (req, res, next) => {
  if (!process.env.ADMIN_PASSWORD || req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  next();
};

const validPhone = (p) => /^(0|\+212)[567]\d{8}$/.test(String(p).replace(/\s/g, ""));

const publicView = (o) => ({
  _id: o._id, fullName: o.fullName, phone: o.phone,
  city: o.city, address: o.address, status: o.status,
});

// المشتري: تسجيل طلب
router.post("/", async (req, res) => {
  try {
    const { fullName, phone, city, address } = req.body;
    if (!fullName || !phone || !city || !address)
      return res.status(400).json({ message: "عمر جميع الخانات المطلوبة" });
    if (!validPhone(phone))
      return res.status(400).json({ message: "رقم الهاتف غير صحيح" });

    const editToken = crypto.randomBytes(16).toString("hex");
    const order = await Order.create({ fullName, phone, city, address, editToken });
    res.status(201).json({ id: order._id, token: editToken });
  } catch {
    res.status(500).json({ message: "وقع مشكل فالسيرفر" });
  }
});

const checkOwner = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    const token = req.headers["x-edit-token"];
    if (!order || !token || order.editToken !== token)
      return res.status(404).json({ message: "الطلب ما كايناش" });
    req.order = order;
    next();
  } catch {
    res.status(404).json({ message: "الطلب ما كايناش" });
  }
};

// المشتري: يشوف طلبو
router.get("/mine/:id", checkOwner, (req, res) => res.json(publicView(req.order)));

// المشتري: يعدل طلبو (غير ملي الحالة "جديد")
router.put("/mine/:id", checkOwner, async (req, res) => {
  const order = req.order;
  if (order.status !== "جديد")
    return res.status(403).json({ message: "ما بقاش ممكن تعدل الطلب" });

  const { fullName, phone, city, address } = req.body;
  if (!fullName || !phone || !city || !address)
    return res.status(400).json({ message: "عمر جميع الخانات المطلوبة" });
  if (!validPhone(phone))
    return res.status(400).json({ message: "رقم الهاتف غير صحيح" });

  Object.assign(order, { fullName, phone, city, address });
  await order.save();
  res.json(publicView(order));
});

// ---------- Admin ----------
router.get("/", checkAdmin, async (req, res) => {
  const orders = await Order.find().select("-editToken -note").sort({ createdAt: -1 });
  res.json(orders);
});

router.patch("/:id", checkAdmin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true, runValidators: true }
  ).select("-editToken -note");
  if (!order) return res.status(404).json({ message: "الطلب ما كايناش" });
  res.json(order);
});

router.delete("/:id", checkAdmin, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "تم الحذف" });
});

module.exports = router;