import { Label } from "@/components/ui/label";
import { CONSULT_GROUPS, SKIN_PRODUCT_TYPES } from "@/lib/consultation";

// Lets the admin choose which beauty-consultation answers a product is recommended for.
const ConsultTagPicker = ({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) => {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter(t => t !== id) : [...value, id]);
  const chip = (id: string, label: string) => {
    const active = value.includes(id);
    return (
      <button
        type="button"
        key={id}
        onClick={() => toggle(id)}
        aria-pressed={active}
        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"}`}
      >
        {label}
      </button>
    );
  };
  const hasSkin = CONSULT_GROUPS[0].tags.some(t => value.includes(t.id));
  return (
    <div className="space-y-3">
      <div>
        <Label>뷰티 상담 추천</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          홈의 뷰티 상담에서 방문자가 고른 고민에 맞춰 이 상품을 추천합니다. 해당하는 고민을 모두 선택하세요.
        </p>
      </div>
      {CONSULT_GROUPS.map(group => (
        <div key={group.category} className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-2">{group.tags.map(t => chip(t.id, t.label))}</div>
        </div>
      ))}
      {hasSkin && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">스킨케어 제품 종류 (하나만)</p>
          <div className="flex flex-wrap gap-2">
            {SKIN_PRODUCT_TYPES.map(t => {
              const active = value.includes(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  aria-pressed={active}
                  onClick={() => onChange([...value.filter(v => !SKIN_PRODUCT_TYPES.some(s => s.id === v)), ...(active ? [] : [t.id])])}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">방문자가 제품 종류로 좁혀 볼 때와 사용 순서를 정할 때 쓰입니다.</p>
        </div>
      )}
    </div>
  );
};

export default ConsultTagPicker;
