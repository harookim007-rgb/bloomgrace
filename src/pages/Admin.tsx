import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ExternalLink, Menu as MenuIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar, { menuGroups } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminBanners from "@/components/admin/AdminBanners";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminShipping from "@/components/admin/AdminShipping";
import AdminPayment from "@/components/admin/AdminPayment";
import AdminOtpGate from "@/components/admin/AdminOtpGate";
import AdminRanking from "@/components/admin/AdminRanking";
import AdminMenus from "@/components/admin/AdminMenus";
import AdminInquiries from "@/components/admin/AdminInquiries";
import AdminCafe24 from "@/components/admin/AdminCafe24";
import { isAdminOtpVerified } from "@/lib/adminOtp";

export type AdminTab =
  | "dashboard" | "products" | "categories" | "orders"
  | "customers" | "coupons" | "banners" | "reviews"
  | "shipping" | "payment" | "settings" | "ranking"
  | "menus" | "inquiries" | "cafe24";

const adminTabs: AdminTab[] = [
  "dashboard", "products", "categories", "orders", "customers", "coupons",
  "banners", "reviews", "shipping", "payment", "settings", "ranking",
  "menus", "inquiries", "cafe24",
];


const getAdminTab = (value: string | null): AdminTab | null => {
  return value && adminTabs.includes(value as AdminTab) ? (value as AdminTab) : null;
};

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTabState] = useState<AdminTab>(() => getAdminTab(searchParams.get("tab")) || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [otpVerified, setOtpVerified] = useState(() => isAdminOtpVerified(user?.id));

  useEffect(() => {
    const tab = getAdminTab(searchParams.get("tab"));
    if (tab && tab !== activeTab) setActiveTabState(tab);
  }, [searchParams, activeTab]);

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    setSearchParams(tab === "dashboard" ? {} : { tab });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.info("관리자 로그인이 필요합니다.");
      navigate("/auth?redirect=/admin");
    } else if (!isAdmin) {
      toast.error("관리자 권한이 없는 계정입니다.");
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setOtpVerified(isAdminOtpVerified(user.id));
  }, [user]);

  // Open work shown next to the sidebar items; refreshed whenever the admin switches screens.
  const [badges, setBadges] = useState<Partial<Record<AdminTab, number>>>({});
  useEffect(() => {
    if (!isAdmin || !otpVerified) return;
    Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
      supabase.from("inquiries").select("id", { count: "exact", head: true }).or("status.eq.pending,status.is.null"),
    ]).then(([o, q]) => setBadges({ orders: o.count || 0, inquiries: q.count || 0 }));
  }, [isAdmin, otpVerified, activeTab]);

  if (authLoading) return <div className="min-h-dvh flex items-center justify-center text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;
  if (!otpVerified) return <AdminOtpGate userId={user?.id} onVerified={() => setOtpVerified(true)} />;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard />;
      case "products": return <AdminProducts />;
      case "categories": return <AdminCategories />;
      case "orders": return <AdminOrders />;
      case "customers": return <AdminCustomers />;
      case "coupons": return <AdminCoupons />;
      case "banners": return <AdminBanners />;
      case "reviews": return <AdminReviews />;
      case "shipping": return <AdminShipping />;
      case "payment": return <AdminPayment />;
      case "ranking": return <AdminRanking />;
      case "menus": return <AdminMenus />;
      case "inquiries": return <AdminInquiries />;
      case "cafe24": return <AdminCafe24 />;
      case "settings": return <AdminSettings />;

      default: return <AdminDashboard />;
    }
  };

  const activeGroup = menuGroups.find(g => g.items.some(i => i.id === activeTab));
  const activeLabel = activeGroup?.items.find(i => i.id === activeTab)?.label || "관리자";

  return (
    <div className="min-h-dvh bg-muted/30 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        badges={badges}
      />
      <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <div className="sticky top-0 z-30 h-14 flex items-center gap-2 px-3 md:px-6 bg-card/95 backdrop-blur border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="메뉴 열기"
            className="md:hidden h-11 w-11 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm">
            <span className="hidden sm:inline text-muted-foreground">{activeGroup?.title} / </span>
            <span className="font-semibold">{activeLabel}</span>
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4" /><span className="hidden sm:inline">쇼핑몰 보기</span>
          </a>
        </div>
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
