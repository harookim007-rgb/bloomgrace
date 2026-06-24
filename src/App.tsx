import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import QA from "./pages/QA";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import MyPage from "./pages/MyPage";
import Checkout from "./pages/Checkout";
import CompleteProfile from "./pages/CompleteProfile";
import Admin from "./pages/Admin";
import DesignModeOverlay from "./components/design/DesignModeOverlay";
import NotFound from "./pages/NotFound";
import Trust from "./pages/Trust";
import Ranking from "./pages/Ranking";
import FallingPetals from "./components/FallingPetals";
import ScatteredFlorals from "./components/FloralDecor";

const queryClient = new QueryClient();

const GlobalPetals = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <ScatteredFlorals count={7} />
      <div className="pointer-events-none fixed inset-0 z-0">
        <FallingPetals count={12} />
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DesignModeOverlay />
            <GlobalPetals />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/qa" element={<QA />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/trust" element={<Trust />} />
              <Route path="/ranking" element={<Ranking />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
