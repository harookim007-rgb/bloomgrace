import { create } from "zustand";

export type Viewport = "desktop" | "mobile";

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  parentId: string | null;
  sortOrder: number;
  seoDescription: string;
  access: "public" | "members" | "private";
  openNewTab: boolean;
  children?: MenuItem[];
}

export interface WidgetItem {
  id: string;
  type: string;
  category: string;
  label: string;
  settings: Record<string, any>;
}

export interface SectionItem {
  id: string;
  type: string;
  label: string;
  widgets: WidgetItem[];
  settings: {
    background: string;
    backgroundImage: string;
    paddingTop: number;
    paddingBottom: number;
    maxWidth: string;
    visibility: "all" | "desktop" | "mobile";
    parallax: boolean;
  };
}

export interface GlobalDesign {
  typography: {
    bodyFont: string;
    headingFont: string;
    bodySize: number;
    lineHeight: number;
    letterSpacing: number;
    h1Size: number;
    h2Size: number;
    h3Size: number;
  };
  colors: {
    primary: string;
    accent: string;
    background: string;
    bodyText: string;
    headingText: string;
    linkColor: string;
    linkHover: string;
    buttonBg: string;
    buttonText: string;
    headerBg: string;
    footerBg: string;
  };
  layout: {
    maxWidth: number;
    sectionPaddingY: number;
    sectionPaddingX: number;
    borderRadius: number;
  };
  button: {
    shape: "square" | "rounded" | "pill";
    type: "filled" | "outline" | "text";
    size: "sm" | "md" | "lg";
    textTransform: "none" | "uppercase" | "lowercase";
    hoverEffect: "lighten" | "darken" | "color-change" | "none";
  };
  header: {
    height: number;
    background: "white" | "dark" | "transparent";
    overlap: boolean;
    logoSize: number;
  };
  footer: {
    background: string;
    layout: "1col" | "2col" | "3col";
  };
}

export type ActionType =
  | "text_edit" | "image_replace" | "widget_add" | "widget_delete"
  | "section_add" | "section_delete" | "section_reorder"
  | "style_change" | "setting_change" | "menu_change";

export interface HistoryAction {
  type: ActionType;
  timestamp: number;
  before: any;
  after: any;
  description: string;
}

export type DesignPanel = "none" | "menu" | "widget" | "section" | "global-design" | "widget-settings" | "section-settings" | "header-edit";

interface DesignModeState {
  editMode: boolean;
  viewport: Viewport;
  currentPage: string;
  currentPageName: string;
  activePanel: DesignPanel;
  selectedWidgetId: string | null;
  selectedSectionId: string | null;
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
  pendingChanges: Record<string, any>;
  isDirty: boolean;
  lastAutoSave: string | null;
  headerOverlap: boolean;
  headerEditMode: boolean;

  // Menus
  menus: MenuItem[];

  // Sections (page content)
  sections: SectionItem[];

  // Global design
  globalDesign: GlobalDesign;

  // Actions
  setEditMode: (v: boolean) => void;
  setViewport: (v: Viewport) => void;
  setCurrentPage: (page: string, name: string) => void;
  setActivePanel: (p: DesignPanel) => void;
  setSelectedWidget: (id: string | null) => void;
  setSelectedSection: (id: string | null) => void;
  setHeaderOverlap: (v: boolean) => void;
  setHeaderEditMode: (v: boolean) => void;

  // Undo/Redo
  pushAction: (action: Omit<HistoryAction, "timestamp">) => void;
  undo: () => void;
  redo: () => void;

  // Menu management
  setMenus: (menus: MenuItem[]) => void;
  addMenu: (menu: MenuItem) => void;
  updateMenu: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenu: (id: string) => void;
  reorderMenus: (menus: MenuItem[]) => void;

  // Section management
  setSections: (sections: SectionItem[]) => void;
  addSection: (section: SectionItem, afterId?: string) => void;
  updateSection: (id: string, updates: Partial<SectionItem>) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (sections: SectionItem[]) => void;

  // Global design
  updateGlobalDesign: (path: string, value: any) => void;

  // Pending changes
  markDirty: () => void;
  clearDirty: () => void;
  autoSave: () => void;

  // Publish
  publish: () => void;
  revertToPublished: () => void;
}

const defaultGlobalDesign: GlobalDesign = {
  typography: {
    bodyFont: "Pretendard",
    headingFont: "DM Serif Display",
    bodySize: 14,
    lineHeight: 1.6,
    letterSpacing: 0,
    h1Size: 48,
    h2Size: 36,
    h3Size: 24,
  },
  colors: {
    primary: "348 52% 63%",
    accent: "348 30% 94%",
    background: "0 0% 100%",
    bodyText: "0 0% 30%",
    headingText: "0 0% 10%",
    linkColor: "348 52% 63%",
    linkHover: "348 52% 50%",
    buttonBg: "348 52% 63%",
    buttonText: "0 0% 100%",
    headerBg: "0 0% 100%",
    footerBg: "0 0% 96%",
  },
  layout: {
    maxWidth: 1200,
    sectionPaddingY: 80,
    sectionPaddingX: 40,
    borderRadius: 0,
  },
  button: {
    shape: "square",
    type: "filled",
    size: "md",
    textTransform: "uppercase",
    hoverEffect: "darken",
  },
  header: {
    height: 72,
    background: "white",
    overlap: false,
    logoSize: 100,
  },
  footer: {
    background: "0 0% 96%",
    layout: "3col",
  },
};

const defaultMenus: MenuItem[] = [
  { id: "home", name: "홈", slug: "/", url: "/", parentId: null, sortOrder: 0, seoDescription: "", access: "public", openNewTab: false },
  { id: "products", name: "제품", slug: "/products", url: "/products", parentId: null, sortOrder: 1, seoDescription: "", access: "public", openNewTab: false },
  { id: "qa", name: "Q&A", slug: "/qa", url: "/qa", parentId: null, sortOrder: 2, seoDescription: "", access: "public", openNewTab: false },
  { id: "contact", name: "문의", slug: "/contact", url: "/contact", parentId: null, sortOrder: 3, seoDescription: "", access: "public", openNewTab: false },
];

const defaultSections: SectionItem[] = [
  { id: "hero", type: "hero", label: "히어로 배너", widgets: [], settings: { background: "", backgroundImage: "", paddingTop: 0, paddingBottom: 0, maxWidth: "full", visibility: "all", parallax: false } },
  { id: "featured", type: "products", label: "추천 상품", widgets: [], settings: { background: "", backgroundImage: "", paddingTop: 80, paddingBottom: 80, maxWidth: "1200px", visibility: "all", parallax: false } },
  { id: "about", type: "text-image", label: "브랜드 소개", widgets: [], settings: { background: "", backgroundImage: "", paddingTop: 80, paddingBottom: 80, maxWidth: "1200px", visibility: "all", parallax: false } },
  { id: "consultation", type: "cta", label: "AI 뷰티 상담", widgets: [], settings: { background: "", backgroundImage: "", paddingTop: 60, paddingBottom: 60, maxWidth: "1200px", visibility: "all", parallax: false } },
];

export const useDesignModeStore = create<DesignModeState>((set, get) => ({
  editMode: false,
  viewport: "desktop",
  currentPage: "/",
  currentPageName: "홈",
  activePanel: "none",
  selectedWidgetId: null,
  selectedSectionId: null,
  undoStack: [],
  redoStack: [],
  pendingChanges: {},
  isDirty: false,
  lastAutoSave: null,
  headerOverlap: false,
  headerEditMode: false,
  menus: defaultMenus,
  sections: defaultSections,
  globalDesign: defaultGlobalDesign,

  setEditMode: (v) => set({ editMode: v, activePanel: "none" }),
  setViewport: (v) => set({ viewport: v }),
  setCurrentPage: (page, name) => set({ currentPage: page, currentPageName: name }),
  setActivePanel: (p) => set({ activePanel: p, selectedWidgetId: null, selectedSectionId: null }),
  setSelectedWidget: (id) => set({ selectedWidgetId: id }),
  setSelectedSection: (id) => set({ selectedSectionId: id }),
  setHeaderOverlap: (v) => set({ headerOverlap: v }),
  setHeaderEditMode: (v) => set({ headerEditMode: v, activePanel: v ? "header-edit" : "none" }),

  pushAction: (action) => {
    const state = get();
    const newAction = { ...action, timestamp: Date.now() };
    const newStack = [...state.undoStack, newAction].slice(-50);
    set({ undoStack: newStack, redoStack: [], isDirty: true });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const last = state.undoStack[state.undoStack.length - 1];
    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, last],
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const last = state.redoStack[state.redoStack.length - 1];
    set({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, last],
    });
  },

  setMenus: (menus) => set({ menus }),
  addMenu: (menu) => {
    const state = get();
    set({ menus: [...state.menus, menu], isDirty: true });
  },
  updateMenu: (id, updates) => {
    const state = get();
    set({ menus: state.menus.map(m => m.id === id ? { ...m, ...updates } : m), isDirty: true });
  },
  deleteMenu: (id) => {
    const state = get();
    set({ menus: state.menus.filter(m => m.id !== id), isDirty: true });
  },
  reorderMenus: (menus) => set({ menus, isDirty: true }),

  setSections: (sections) => set({ sections }),
  addSection: (section, afterId) => {
    const state = get();
    if (afterId) {
      const idx = state.sections.findIndex(s => s.id === afterId);
      const newSections = [...state.sections];
      newSections.splice(idx + 1, 0, section);
      set({ sections: newSections, isDirty: true });
    } else {
      set({ sections: [...state.sections, section], isDirty: true });
    }
  },
  updateSection: (id, updates) => {
    const state = get();
    set({ sections: state.sections.map(s => s.id === id ? { ...s, ...updates } : s), isDirty: true });
  },
  deleteSection: (id) => {
    const state = get();
    set({ sections: state.sections.filter(s => s.id !== id), isDirty: true });
  },
  duplicateSection: (id) => {
    const state = get();
    const section = state.sections.find(s => s.id === id);
    if (!section) return;
    const newSection = { ...section, id: `${id}-copy-${Date.now()}`, label: `${section.label} (복사)` };
    const idx = state.sections.findIndex(s => s.id === id);
    const newSections = [...state.sections];
    newSections.splice(idx + 1, 0, newSection);
    set({ sections: newSections, isDirty: true });
  },
  reorderSections: (sections) => set({ sections, isDirty: true }),

  updateGlobalDesign: (path, value) => {
    const state = get();
    const keys = path.split(".");
    const newDesign = JSON.parse(JSON.stringify(state.globalDesign));
    let obj: any = newDesign;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    set({ globalDesign: newDesign, isDirty: true });
  },

  markDirty: () => set({ isDirty: true }),
  clearDirty: () => set({ isDirty: false }),
  autoSave: () => {
    const state = get();
    localStorage.setItem("design_mode_draft", JSON.stringify({
      menus: state.menus,
      sections: state.sections,
      globalDesign: state.globalDesign,
      headerOverlap: state.headerOverlap,
    }));
    set({ lastAutoSave: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  },

  publish: () => {
    const state = get();
    localStorage.setItem("design_mode_published", JSON.stringify({
      menus: state.menus,
      sections: state.sections,
      globalDesign: state.globalDesign,
      headerOverlap: state.headerOverlap,
    }));
    set({ isDirty: false, pendingChanges: {} });
  },

  revertToPublished: () => {
    const saved = localStorage.getItem("design_mode_published");
    if (saved) {
      const data = JSON.parse(saved);
      set({
        menus: data.menus,
        sections: data.sections,
        globalDesign: data.globalDesign,
        headerOverlap: data.headerOverlap,
        isDirty: false,
      });
    }
  },
}));
