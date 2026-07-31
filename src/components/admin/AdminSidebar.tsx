import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users,
  Tag, Image, Star, Settings, ChevronLeft, ChevronRight, LogOut, Home, Paintbrush,
  Truck, Wallet, Trophy, Menu as MenuIcon, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignModeStore } from "@/stores/designModeStore";
import type { AdminTab } from "@/pages/Admin";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuGroups: { title: string; items: { id: AdminTab; label: string; icon: React.ElementType }[] }[] = [
  {
    title: "개요",
    items: [{ id: "dashboard", label: "대시보드", icon: LayoutDashboard }],
  },
  {
    title: "판매",
    items: [
      { id: "orders", label: "주문 관리", icon: ShoppingCart },
      { id: "coupons", label: "쿠폰/이벤트", icon: Tag },
      { id: "ranking", label: "랭킹 관리", icon: Trophy },
    ],
  },
  {
    title: "회원",
    items: [
      { id: "customers", label: "고객 관리", icon: Users },
      { id: "inquiries", label: "CS 문의 관리", icon: MessageSquare },
      { id: "reviews", label: "리뷰 관리", icon: Star },
    ],
  },

  {
    title: "콘텐츠",
    items: [
      { id: "products", label: "상품 관리", icon: Package },
      { id: "categories", label: "카테고리 관리", icon: FolderTree },
      { id: "banners", label: "배너/프로모션", icon: Image },
      { id: "menus", label: "메뉴 관리", icon: MenuIcon },
    ],
  },
  {
    title: "설정",
    items: [
      { id: "shipping", label: "배송비 관리", icon: Truck },
      { id: "payment", label: "결제 설정", icon: Wallet },
      { id: "whitelist", label: "관리자 화이트리스트", icon: ShieldCheck },
      { id: "settings", label: "사이트 설정", icon: Settings },
    ],
  },
];

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: AdminSidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const setEditMode = useDesignModeStore(s => s.setEditMode);

  const handleDesignMode = () => {
    setEditMode(true);
    navigate("/");
  };

  return (
    <aside className={`fixed left-0 top-0 h-dvh bg-card border-r border-border z-50 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {isOpen && <h1 className="text-lg font-bold font-serif truncate">관리자 패널</h1>}
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="shrink-0">
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {menuGroups.map(group => (
          <div key={group.title} className="mb-4">
            {isOpen && (
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                {group.title}
              </p>
            )}
            <div className="space-y-1 mt-1">
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        <button
          onClick={handleDesignMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Paintbrush className="h-5 w-5 shrink-0" />
          {isOpen && <span>디자인 모드</span>}
        </button>
        <Link to="/">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Home className="h-5 w-5 shrink-0" />
            {isOpen && <span>사이트로 이동</span>}
          </button>
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {isOpen && <span>로그아웃</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
