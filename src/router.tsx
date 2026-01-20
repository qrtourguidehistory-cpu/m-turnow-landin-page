import { Routes, Route } from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";

const Router = () => (
  <Routes>
    {/* Landing Page Routes */}
    <Route path="/" element={<Index />} />
    <Route path="/contacto" element={<Contact />} />
    <Route path="/terminos" element={<Terms />} />
    <Route path="/privacidad" element={<Privacy />} />
    <Route path="/cookies" element={<Cookies />} />
    
    {/* Admin Routes */}
    <Route path="/admin/*" element={<AdminApp />} />
    
    {/* 404 Route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default Router;