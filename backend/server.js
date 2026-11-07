require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/orders", require("./routes/orders"));

app.get("/", (req, res) => res.send("API كتخدم ✅"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ متصل بـ MongoDB");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 السيرفر خدام على البورت ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ مشكل فالاتصال:", err.message));