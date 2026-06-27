import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const countries = [
  { code: "US", name: "United States", phoneCode: "+1", needsCustoms: true },
  { code: "GB", name: "United Kingdom", phoneCode: "+44", needsCustoms: true },
  { code: "DE", name: "Germany", phoneCode: "+49", needsCustoms: true },
  { code: "FR", name: "France", phoneCode: "+33", needsCustoms: true },
  { code: "IT", name: "Italy", phoneCode: "+39", needsCustoms: true },
  { code: "ES", name: "Spain", phoneCode: "+34", needsCustoms: true },
  { code: "PT", name: "Portugal", phoneCode: "+351", needsCustoms: true },
  { code: "JP", name: "Japan", phoneCode: "+81", needsCustoms: true },
  { code: "SA", name: "Saudi Arabia", phoneCode: "+966", needsCustoms: true },
  { code: "AE", name: "United Arab Emirates", phoneCode: "+971", needsCustoms: true },
  { code: "CA", name: "Canada", phoneCode: "+1", needsCustoms: true },
  { code: "AU", name: "Australia", phoneCode: "+61", needsCustoms: true },
  { code: "SG", name: "Singapore", phoneCode: "+65", needsCustoms: true },
  { code: "TH", name: "Thailand", phoneCode: "+66", needsCustoms: true },
  { code: "VN", name: "Vietnam", phoneCode: "+84", needsCustoms: true },
  { code: "CN", name: "China", phoneCode: "+86", needsCustoms: true },
  { code: "KR", name: "South Korea", phoneCode: "+82", needsCustoms: false },
];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [form, setForm] = useState({
    phone: "",
    address_line1: "",
    address_line2: "",
    shipping_address: "",
    postal_code: "",
    city: "",
    customs_number: "",
  });

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      // Update profile phone
      await supabase
        .from("profiles")
        .update({ phone: `${country.phoneCode} ${form.phone}` })
        .eq("user_id", user.id);

      // Save address
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        name: user.user_metadata?.display_name || user.email?.split("@")[0] || "",
        phone: `${country.phoneCode} ${form.phone}`,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: `${form.city} (${country.name})`,
        postal_code: form.postal_code,
        is_default: true,
      });
      if (error) throw error;

      toast.success(t("cp_success"));
      navigate("/");
    } catch {
      toast.error(t("cp_fail"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-dvh">
      <Navigation />
      <section className="py-12 md:py-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl md:text-3xl font-serif font-light">{t("cp_title")}</h1>
            <p className="text-sm text-muted-foreground">{t("cp_subtitle")}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Country */}
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase">{t("cp_country")}</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone with country code */}
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase">{t("cp_phone")}</Label>
              <div className="flex gap-2">
                <div className="w-24 flex items-center justify-center border border-input bg-muted/30 text-sm text-muted-foreground px-3">
                  {country.phoneCode}
                </div>
                <Input
                  type="tel"
                  className="rounded-none flex-1"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase">{t("cp_address")}</Label>
              <Input
                className="rounded-none"
                value={form.address_line1}
                onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase">{t("cp_detail_address")}</Label>
              <Input
                className="rounded-none"
                value={form.address_line2}
                onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs tracking-wider uppercase">{t("cp_postal")}</Label>
                <Input
                  className="rounded-none"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-wider uppercase">{t("cp_city")}</Label>
                <Input
                  className="rounded-none"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Customs number - only for international */}
            {country.needsCustoms && (
              <div className="space-y-2">
                <Label className="text-xs tracking-wider uppercase">{t("cp_customs_number")}</Label>
                <Input
                  className="rounded-none"
                  value={form.customs_number}
                  onChange={(e) => setForm({ ...form, customs_number: e.target.value })}
                  placeholder="P000-0000-0000"
                />
                <p className="text-[11px] text-muted-foreground">{t("cp_customs_hint")}</p>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase"
                disabled={isSaving}
              >
                {isSaving ? t("cp_saving") : t("cp_save")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs tracking-wider uppercase text-muted-foreground"
                onClick={() => navigate("/")}
              >
                {t("cp_skip")}
              </Button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CompleteProfile;
