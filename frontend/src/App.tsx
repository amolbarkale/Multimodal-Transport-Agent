import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard Pages
import BusDashboard from "./pages/dashboard/BusDashboard";
import ManageRoutes from "./pages/dashboard/ManageRoutes";
import StopsPaths from "./pages/dashboard/StopsPaths";
import Vehicles from "./pages/dashboard/Vehicles";
import Drivers from "./pages/dashboard/Drivers";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root redirect to login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/buses" replace />} />
          <Route path="/dashboard/buses" element={<BusDashboard />} />
          <Route path="/dashboard/routes" element={<ManageRoutes />} />
          <Route path="/dashboard/stops-paths" element={<StopsPaths />} />
          <Route path="/dashboard/vehicles" element={<Vehicles />} />
          <Route path="/dashboard/drivers" element={<Drivers />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
