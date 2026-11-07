const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["جديد", "تم الطلب", "تم الاتصال", "تم البيع", "ملغي"],
      default: "جديد",
    },
    editToken: { type: String, required: true },

  },
  { timestamps: true }


);


module.exports = mongoose.model("Order", orderSchema);