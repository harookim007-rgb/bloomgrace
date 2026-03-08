import { useState } from "react";
import { useDesignModeStore } from "@/stores/designModeStore";
import { X, GripVertical, Settings, Plus, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MenuManagerPanel = () => {
  const { activePanel, menus, setActivePanel, addMenu, updateMenu, deleteMenu, reorderMenus } = useDesignModeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  if (activePanel !== "menu") return null;

  const editingMenu = menus.find(m => m.id === editingId);

  const handleAddMenu = () => {
    const id = `menu-${Date.now()}`;
    addMenu({
      id,
      name: "새 메뉴",
      slug: "/new-page",
      url: "/new-page",
      parentId: null,
      sortOrder: menus.length,
      seoDescription: "",
      access: "public",
      openNewTab: false,
    });
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("이 메뉴를 삭제하시겠습니까?")) {
      deleteMenu(id);
      if (editingId === id) setEditingId(null);
    }
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const newMenus = [...menus];
    const dragIdx = newMenus.findIndex(m => m.id === dragId);
    const targetIdx = newMenus.findIndex(m => m.id === targetId);
    const [removed] = newMenus.splice(dragIdx, 1);
    newMenus.splice(targetIdx, 0, removed);
    reorderMenus(newMenus);
  };
  const handleDragEnd = () => setDragId(null);

  return (
    <div className="fixed left-0 top-[52px] bottom-0 w-[300px] bg-background border-r border-border shadow-2xl z-[9998] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">메뉴 관리</h3>
        <button onClick={() => setActivePanel("none")} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Menu list or settings */}
      {editingMenu ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <button onClick={() => setEditingId(null)} className="text-xs text-primary hover:underline">← 목록으로</button>

          <div>
            <Label className="text-xs">메뉴명</Label>
            <Input value={editingMenu.name} onChange={e => updateMenu(editingMenu.id, { name: e.target.value })} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs">URL 슬러그</Label>
            <Input value={editingMenu.slug} onChange={e => updateMenu(editingMenu.id, { slug: e.target.value, url: e.target.value })} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs">SEO 설명</Label>
            <Textarea value={editingMenu.seoDescription} onChange={e => updateMenu(editingMenu.id, { seoDescription: e.target.value })} className="mt-1" rows={2} />
          </div>

          <div>
            <Label className="text-xs">접근 권한</Label>
            <Select value={editingMenu.access} onValueChange={v => updateMenu(editingMenu.id, { access: v as any })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">전체공개</SelectItem>
                <SelectItem value="members">회원만</SelectItem>
                <SelectItem value="private">비공개</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">새 탭에서 열기</Label>
            <Switch checked={editingMenu.openNewTab} onCheckedChange={v => updateMenu(editingMenu.id, { openNewTab: v })} />
          </div>

          <Button variant="destructive" size="sm" onClick={() => handleDelete(editingMenu.id)} className="w-full mt-4">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> 메뉴 삭제
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {menus.map((menu) => (
              <div
                key={menu.id}
                draggable
                onDragStart={() => handleDragStart(menu.id)}
                onDragOver={(e) => handleDragOver(e, menu.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 px-3 py-2.5 rounded hover:bg-muted/50 group cursor-move transition-colors ${dragId === menu.id ? "opacity-50" : ""}`}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                <span className="flex-1 text-sm">{menu.name}</span>
                <span className="text-[10px] text-muted-foreground hidden group-hover:inline">{menu.slug}</span>
                <button onClick={() => setEditingId(menu.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity">
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add button */}
      {!editingMenu && (
        <div className="p-3 border-t border-border">
          <Button onClick={handleAddMenu} variant="outline" size="sm" className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1" /> 새 메뉴 추가
          </Button>
        </div>
      )}
    </div>
  );
};

export default MenuManagerPanel;
