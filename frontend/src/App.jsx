import { Routes, Route } from "react-router-dom";
import ProductPage from "./pages/ProductPage";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import MyOrder from "./pages/MyOrder";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/order/:id" element={<MyOrder />} />
      <Route path="/thanks" element={<ThankYou />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}