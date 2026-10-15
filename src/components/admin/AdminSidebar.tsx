import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users,
  Tag, Image, Star, Settings, ChevronLeft, ChevronRight, LogOut, Home, Paintbrush,
  Truck, Wallet, Trophy, Menu as MenuIcon, MessageSquare, Store, HelpCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminTab } from "@/pages/Admin";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  // Open work per tab (e.g. orders awaiting payment), shown as a count next to the menu item.
  badges?: Partial<Record<AdminTab, number>>;
}

export const menuGroups: { title: string; items: { id: AdminTab; label: string; icon: React.ElementType }[] }[] = [
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
      { id: "faq", label: "FAQ 관리", icon: HelpCircle },
    ],
  },
  {
    title: "설정",
    items: [
      { id: "shipping", label: "배송비 관리", icon: Truck },
      { id: "payment", label: "결제 설정", icon: Wallet },
      { id: "cafe24", label: "카페24 연동", icon: Store },
      { id: "settings", label: "사이트 설정", icon: Settings },
    ],
  },
];

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, badges = {} }: AdminSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // On phones the sidebar is a drawer, so close it once a destination is picked.
  const closeOnMobile = () => { if (window.innerWidth < 768) setIsOpen(false); };

  const footerItem = "w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors";

  return (
    <aside className={`fixed left-0 top-0 h-dvh bg-slate-900 text-slate-300 z-50 flex flex-col transition-all duration-300 ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-16 md:translate-x-0'}`}>
      <div className="h-14 shrink-0 flex items-center gap-2 px-3 border-b border-white/10">
        {isOpen && (
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-1">
            <span className="h-8 w-8 shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">Y</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white truncate">Youthroom</span>
              <span className="block text-[11px] text-slate-400 truncate">관리자</span>
            </span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "메뉴 접기" : "메뉴 펼치기"}
          className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors ${isOpen ? "" : "mx-auto"}`}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {menuGroups.map(group => (
          <div key={group.title} className="mb-3">
            {isOpen
              ? <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-500">{group.title}</p>
              : <div className="mx-3 my-2 border-t border-white/10" />}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = activeTab === item.id;
                const badge = badges[item.id] || 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); closeOnMobile(); }}
                    title={!isOpen ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`relative w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors
                      ${active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary" />}
                    <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                    {isOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                    {badge > 0 && (isOpen
                      ? <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center tabular-nums">{badge > 99 ? "99+" : badge}</span>
                      : <span className="absolute top-1.5 right-2.5 h-2 w-2 rounded-full bg-primary" />)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-2 space-y-0.5">
        <button
          onClick={() => navigate("/admin/design")}
          title={!isOpen ? "디자인 모드" : undefined}
          className={`${footerItem} bg-primary text-primary-foreground hover:bg-primary/90 ${isOpen ? "" : "justify-center px-0"}`}
        >
          <Paintbrush className="h-[18px] w-[18px] shrink-0" />
          {isOpen && <span>디자인 모드</span>}
        </button>
        <Link to="/" title={!isOpen ? "쇼핑몰로 이동" : undefined} className={`${footerItem} text-slate-300 hover:bg-white/5 hover:text-white`}>
          <Home className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          {isOpen && <span>쇼핑몰로 이동</span>}
        </Link>
        <button onClick={signOut} title={!isOpen ? "로그아웃" : undefined} className={`${footerItem} text-slate-300 hover:bg-white/5 hover:text-white`}>
          <LogOut className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          {isOpen && (
            <span className="min-w-0 text-left">
              <span className="block leading-tight">로그아웃</span>
              {user?.email && <span className="block text-[11px] text-slate-500 truncate leading-tight">{user.email}</span>}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
