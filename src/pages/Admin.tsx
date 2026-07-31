import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
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
import AdminWhitelist from "@/components/admin/AdminWhitelist";
import AdminInquiries from "@/components/admin/AdminInquiries";

export type AdminTab =
  | "dashboard" | "products" | "categories" | "orders"
  | "customers" | "coupons" | "banners" | "reviews"
  | "shipping" | "payment" | "settings" | "ranking"
  | "menus" | "whitelist" | "inquiries";

const adminTabs: AdminTab[] = [
  "dashboard", "products", "categories", "orders", "customers", "coupons",
  "banners", "reviews", "shipping", "payment", "settings", "ranking",
  "menus", "whitelist", "inquiries",
];


const getAdminTab = (value: string | null): AdminTab | null => {
  return value && adminTabs.includes(value as AdminTab) ? (value as AdminTab) : null;
};

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTabState] = useState<AdminTab>(() => getAdminTab(searchParams.get("tab")) || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [otpVerified, setOtpVerified] = useState(false);

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
    setOtpVerified(sessionStorage.getItem("admin_otp_verified") === "1");
  }, [user]);

  if (authLoading) return <div className="min-h-dvh flex items-center justify-center text-muted-foreground">로딩 중...</div>;
  if (!isAdmin) return null;
  if (!otpVerified) return <AdminOtpGate onVerified={() => setOtpVerified(true)} />;

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
      case "whitelist": return <AdminWhitelist />;
      case "inquiries": return <AdminInquiries />;
      case "settings": return <AdminSettings />;

      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-dvh bg-muted/30 flex">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
