import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/toaster";
import { Toaster as Sonner } from "./ui/sonner";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "../contexts/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import Establishments from "../pages/Establishments";
import Clients from "../pages/Clients";
import Staff from "../pages/Staff";
import Appointments from "../pages/Appointments";
import Products from "../pages/Products";
import Moderation from "../pages/Moderation";
import Notifications from "../pages/Notifications";
import Metrics from "../pages/Metrics";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

const queryClient = new QueryClient();

const AdminLayout = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="bookwise-admin-theme">
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Routes>
          <Route path="auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="establishments" element={<ProtectedRoute><Establishments /></ProtectedRoute>} />
          <Route path="clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
          <Route path="appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="metrics" element={<ProtectedRoute><Metrics /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default AdminLayout;