import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ConsultationDetail from "./pages/ConsultationDetail";
import TrendAnalysis from "./pages/TrendAnalysis";
import StakeholderAnalytics from "./pages/StakeholderAnalytics";
import ExportReports from "./pages/ExportReports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Authorizations from "./pages/Authorizations";
import AuthPage from "./pages/AuthPage";
import MinisterDashboard from "./pages/MinisterDashboard";
import MinisterConsultationDetail from "./pages/MinisterConsultationDetail";
import NotFound from "./pages/NotFound";
import MinisterLayout from "./components/MinisterLayout";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    } />
    <Route path="/" element={
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/consultation/:id" element={
      <ProtectedRoute>
        <Layout>
          <ConsultationDetail />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/trends" element={
      <ProtectedRoute>
        <Layout>
          <TrendAnalysis />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/analytics" element={
      <ProtectedRoute>
        <Layout>
          <StakeholderAnalytics />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/stakeholderanalytics" element={
      <ProtectedRoute>
        <Layout>
          <StakeholderAnalytics />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/reports" element={
      <ProtectedRoute>
        <Layout>
          <ExportReports />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <Layout>
          <Settings />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute>
        <Layout>
          <Profile />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/authorizations" element={
      <ProtectedRoute>
        <Layout>
          <Authorizations />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/minister" element={
      <ProtectedRoute>
        <MinisterLayout>
          <MinisterDashboard />
        </MinisterLayout>
      </ProtectedRoute>
    } />
    <Route path="/minister/consultation/:id" element={
      <ProtectedRoute>
        <MinisterLayout>
          <MinisterConsultationDetail />
        </MinisterLayout>
      </ProtectedRoute>
    } />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;