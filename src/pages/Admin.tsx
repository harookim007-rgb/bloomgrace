import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Package, ShoppingCart, Users, Tag, Image, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, users: 0 });

  // Product form
  const [productForm, setProductForm] = useState({
    name: "", slug: "", description: "", price: "", original_price: "", category_id: "",
    brand: "Bloom & Grace", image_url: "", stock: "0", is_active: true, is_featured: false
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Coupon form
  const [couponForm, setCouponForm] = useState({
    code: "", description: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", is_active: true
  });

  // Banner form
  const [bannerForm, setBannerForm] = useState({
    title: "", subtitle: "", image_url: "", link_url: "", is_active: true, sort_order: "0"
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [p, c, o, co, b] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("orders").select("*, order_items(*), profiles(display_name)").order("created_at", { ascending: false }),
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("banners").select("*").order("sort_order"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
    setOrders(o.data || []);
    setCoupons(co.data || []);
    setBanners(b.data || []);

    const totalRevenue = (o.data || []).reduce((sum: number, ord: any) => sum + Number(ord.total), 0);
    setStats({
      products: (p.data || []).length,
      orders: (o.data || []).length,
      revenue: totalRevenue,
      users: 0,
    });
  };

  // Product CRUD
  const saveProduct = async () => {
    const slug = productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/-+/g, "-");
    const payload = {
      ...productForm,
      slug,
      price: parseFloat(productForm.price) || 0,
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      stock: parseInt(productForm.stock) || 0,
      category_id: productForm.category_id || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct);
      if (error) { toast.error(error.message); return; }
      toast.success("상품이 수정되었습니다.");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("상품이 등록되었습니다.");
    }
    resetProductForm();
    fetchAll();
  };

  const resetProductForm = () => {
    setProductForm({ name: "", slug: "", description: "", price: "", original_price: "", category_id: "", brand: "Bloom & Grace", image_url: "", stock: "0", is_active: true, is_featured: false });
    setEditingProduct(null);
    setProductDialogOpen(false);
  };

  const editProduct = (p: any) => {
    setProductForm({
      name: p.name, slug: p.slug, description: p.description || "", price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "", category_id: p.category_id || "",
      brand: p.brand || "", image_url: p.image_url || "", stock: String(p.stock),
      is_active: p.is_active, is_featured: p.is_featured
    });
    setEditingProduct(p.id);
    setProductDialogOpen(true);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast.success("상품이 삭제되었습니다.");
    fetchAll();
  };

  // Order status update
  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast.success("주문 상태가 업데이트되었습니다.");
    fetchAll();
  };

  // Coupon CRUD
  const saveCoupon = async () => {
    const { error } = await supabase.from("coupons").insert({
      ...couponForm,
      discount_value: parseFloat(couponForm.discount_value) || 0,
      min_order_amount: parseFloat(couponForm.min_order_amount) || 0,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("쿠폰이 생성되었습니다.");
    setCouponForm({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", is_active: true });
    fetchAll();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("쿠폰이 삭제되었습니다.");
    fetchAll();
  };

  // Banner CRUD
  const saveBanner = async () => {
    const { error } = await supabase.from("banners").insert({
      ...bannerForm,
      sort_order: parseInt(bannerForm.sort_order) || 0,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("배너가 생성되었습니다.");
    setBannerForm({ title: "", subtitle: "", image_url: "", link_url: "", is_active: true, sort_order: "0" });
    fetchAll();
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    toast.success("배너가 삭제되었습니다.");
    fetchAll();
  };

  const statusMap: Record<string, string> = {
    pending: "주문 접수", confirmed: "주문 확인", shipping: "배송 중", delivered: "배송 완료", cancelled: "주문 취소"
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <h1 className="text-xl font-bold font-serif">관리자 대시보드</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "총 상품", value: stats.products, icon: Package },
            { label: "총 주문", value: stats.orders, icon: ShoppingCart },
            { label: "총 매출", value: `${stats.revenue.toLocaleString()}원`, icon: BarChart3 },
            { label: "쿠폰", value: coupons.length, icon: Tag },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <s.icon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="products">상품 관리</TabsTrigger>
            <TabsTrigger value="orders">주문 관리</TabsTrigger>
            <TabsTrigger value="coupons">쿠폰 관리</TabsTrigger>
            <TabsTrigger value="banners">배너 관리</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">상품 목록 ({products.length})</h2>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => resetProductForm()}><Plus className="h-4 w-4" />상품 추가</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingProduct ? "상품 수정" : "새 상품 등록"}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>상품명</Label><Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>판매가 (원)</Label><Input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} /></div>
                      <div><Label>정가 (원, 선택)</Label><Input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} /></div>
                    </div>
                    <div><Label>카테고리</Label>
                      <Select value={productForm.category_id} onValueChange={v => setProductForm({...productForm, category_id: v})}>
                        <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>브랜드</Label><Input value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} /></div>
                    <div><Label>이미지 URL</Label><Input value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} /></div>
                    <div><Label>재고</Label><Input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} /></div>
                    <div><Label>설명</Label><Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} /></div>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2"><Switch checked={productForm.is_active} onCheckedChange={v => setProductForm({...productForm, is_active: v})} /><Label>활성화</Label></div>
                      <div className="flex items-center gap-2"><Switch checked={productForm.is_featured} onCheckedChange={v => setProductForm({...productForm, is_featured: v})} /><Label>추천</Label></div>
                    </div>
                    <Button className="w-full" onClick={saveProduct}>{editingProduct ? "수정" : "등록"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상품명</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>가격</TableHead>
                      <TableHead>재고</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.categories?.name || "-"}</TableCell>
                        <TableCell>{Number(p.price).toLocaleString()}원</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"}`}>
                            {p.is_active ? "활성" : "비활성"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => editProduct(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-lg font-bold mb-4">주문 내역 ({orders.length})</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문일</TableHead>
                      <TableHead>고객</TableHead>
                      <TableHead>상품</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString("ko-KR")}</TableCell>
                        <TableCell className="text-sm">{o.profiles?.display_name || "알 수 없음"}</TableCell>
                        <TableCell className="text-sm">{o.order_items?.map((i: any) => i.product_name).join(", ") || "-"}</TableCell>
                        <TableCell className="font-medium">{Number(o.total).toLocaleString()}원</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {statusMap[o.status] || o.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select value={o.status} onValueChange={v => updateOrderStatus(o.id, v)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>새 쿠폰 등록</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>쿠폰 코드</Label><Input value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} placeholder="WELCOME15" /></div>
                  <div><Label>설명</Label><Input value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>할인 유형</Label>
                      <Select value={couponForm.discount_type} onValueChange={v => setCouponForm({...couponForm, discount_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">퍼센트(%)</SelectItem>
                          <SelectItem value="fixed">정액(원)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>할인 값</Label><Input type="number" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: e.target.value})} /></div>
                  </div>
                  <div><Label>최소 주문금액</Label><Input type="number" value={couponForm.min_order_amount} onChange={e => setCouponForm({...couponForm, min_order_amount: e.target.value})} /></div>
                  <Button onClick={saveCoupon} className="w-full">쿠폰 등록</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>쿠폰 목록</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>코드</TableHead><TableHead>할인</TableHead><TableHead>관리</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {coupons.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono font-medium">{c.code}</TableCell>
                          <TableCell>{c.discount_type === "percentage" ? `${c.discount_value}%` : `${Number(c.discount_value).toLocaleString()}원`}</TableCell>
                          <TableCell><Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCoupon(c.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>새 배너 등록</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>제목</Label><Input value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} /></div>
                  <div><Label>부제</Label><Input value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} /></div>
                  <div><Label>이미지 URL</Label><Input value={bannerForm.image_url} onChange={e => setBannerForm({...bannerForm, image_url: e.target.value})} /></div>
                  <div><Label>링크 URL</Label><Input value={bannerForm.link_url} onChange={e => setBannerForm({...bannerForm, link_url: e.target.value})} /></div>
                  <div><Label>정렬 순서</Label><Input type="number" value={bannerForm.sort_order} onChange={e => setBannerForm({...bannerForm, sort_order: e.target.value})} /></div>
                  <Button onClick={saveBanner} className="w-full">배너 등록</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>배너 목록</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>제목</TableHead><TableHead>상태</TableHead><TableHead>관리</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {banners.map(b => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.title}</TableCell>
                          <TableCell>{b.is_active ? "활성" : "비활성"}</TableCell>
                          <TableCell><Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteBanner(b.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
