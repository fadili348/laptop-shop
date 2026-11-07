export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/orders";


export const PRODUCT = {
  name: "hp compaq 6300 mt pro",
  price: "900dh",
  condition: "مستعمل بحالة ممتازة",
  whatsapp: "0644936476", // رقمك بصيغة دولية بلا + وبلا 0
  images: [
    "/images/pc.png",
    "/images/pc%20bureau.png",
  ],
  specs: [
    ["المعالج", "Intel Core i5 3470"],
    ["الرام", "12 GB"],
    ["التخزين", "500 GB hdd"],
    ["Windows 10" , " 64 bit" ],
    ["كارط الغرافيك", "Intel HD"],
    ],
};