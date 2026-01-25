import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageTransition from "@/components/layout/PageTransition";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import LectureNotes from "./pages/LectureNotes";
import PastPapers from "./pages/PastPapers";
import Tutorials from "./pages/Tutorials";
import Browse from "./pages/Browse";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MyMaterials from "./pages/lecturer/MyMaterials";
import Dashboard from "./pages/Dashboard";
import Bookmarks from "./pages/Bookmarks";
import ViewingHistory from "./pages/ViewingHistory";
import Programs from "./pages/Programs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <PageTransition>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/books" element={<Books />} />
                <Route path="/lecture-notes" element={<LectureNotes />} />
                <Route path="/past-papers" element={<PastPapers />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bookmarks" 
                  element={
                    <ProtectedRoute>
                      <Bookmarks />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/history" 
                  element={
                    <ProtectedRoute>
                      <ViewingHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-materials" 
                  element={
                    <ProtectedRoute>
                      <MyMaterials />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </PageTransition>
            </TooltipProvider>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
