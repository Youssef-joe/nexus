import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// i18n setup
import "./i18n";
import { useLanguageStore } from "./store/languageStore";
import { useAuthStore } from "./store/authStore";

// Components
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { VerifyEmail } from "./pages/VerifyEmail";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { ProjectDetails } from "./pages/ProjectDetails";
import { Profile } from "./pages/Profile";
import { Messages } from "./pages/Messages";
import { Services } from "./pages/Services";
import { About } from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { language, setLanguage } = useLanguageStore();
  const { checkAuth } = useAuthStore();

  // Initialize language and auth on app start
  useEffect(() => {
    setLanguage(language);
    checkAuth();
  }, [language, setLanguage, checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes with full layout */}
            <Route path="/" element={<Layout><Landing /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/services" element={<Layout><Services /></Layout>} />
            
            {/* Auth routes without footer */}
            <Route path="/login" element={<Layout showFooter={false}><Login /></Layout>} />
            <Route path="/signup" element={<Layout showFooter={false}><Signup /></Layout>} />
            <Route path="/verify-email" element={<Layout showFooter={false}><VerifyEmail /></Layout>} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout showFooter={false}>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Layout showFooter={false}>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <Layout showFooter={false}>
                  <ProjectDetails />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout showFooter={false}>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Layout showFooter={false}>
                  <Messages />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
