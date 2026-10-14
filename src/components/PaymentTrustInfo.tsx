import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SUPPORT_EMAIL } from "@/lib/shop";

const T: Record<Language, {
  title: string; steps: [string, string, string]; fees: string; seller: string; regNo: string;
  refund: string; support: string; supportTail: string;
}> = {
  en: {
    title: "How payment works",
    steps: [
      "Place your order. You will see our bank details and your order number.",
      "Transfer the exact total to our Hana Bank account and write your order number in the transfer memo.",
      "We check our bank account, confirm your payment by email, and then ship your order.",
    ],
    fees: "Your bank or intermediary banks may charge international transfer fees.",
    seller: "Sold by", regNo: "Business registration no.", refund: "Cancellation & refund policy",
    support: "Questions? Email", supportTail: "or use the chat. We reply by email.",
  },
  es: {
    title: "Cómo funciona el pago",
    steps: [
      "Haz tu pedido. Verás nuestros datos bancarios y tu número de pedido.",
      "Transfiere el total exacto a nuestra cuenta de Hana Bank e indica tu número de pedido en el concepto.",
      "Revisamos nuestra cuenta, confirmamos tu pago por email y luego enviamos tu pedido.",
    ],
    fees: "Tu banco o los bancos intermediarios pueden cobrar comisiones por transferencia internacional.",
    seller: "Vendido por", regNo: "N.º de registro mercantil", refund: "Política de cancelación y reembolso",
    support: "¿Dudas? Escribe a", supportTail: "o usa el chat. Respondemos por email.",
  },
  de: {
    title: "So funktioniert die Zahlung",
    steps: [
      "Bestellung aufgeben. Sie sehen unsere Bankdaten und Ihre Bestellnummer.",
      "Überweisen Sie den genauen Gesamtbetrag auf unser Konto bei der Hana Bank und geben Sie Ihre Bestellnummer im Verwendungszweck an.",
      "Wir prüfen unser Konto, bestätigen Ihre Zahlung per E-Mail und versenden danach Ihre Bestellung.",
    ],
    fees: "Ihre Bank oder zwischengeschaltete Banken können Gebühren für Auslandsüberweisungen berechnen.",
    seller: "Verkauft von", regNo: "Handelsregister-Nr.", refund: "Stornierungs- und Erstattungsrichtlinie",
    support: "Fragen? Schreiben Sie an", supportTail: "oder nutzen Sie den Chat. Wir antworten per E-Mail.",
  },
  fr: {
    title: "Comment fonctionne le paiement",
    steps: [
      "Passez votre commande. Vous verrez nos coordonnées bancaires et votre numéro de commande.",
      "Virez le montant total exact sur notre compte Hana Bank en indiquant votre numéro de commande dans le libellé.",
      "Nous vérifions notre compte, confirmons votre paiement par e-mail, puis expédions votre commande.",
    ],
    fees: "Votre banque ou des banques intermédiaires peuvent facturer des frais de virement international.",
    seller: "Vendu par", regNo: "N° d'immatriculation", refund: "Politique d'annulation et de remboursement",
    support: "Une question ? Écrivez à", supportTail: "ou utilisez le chat. Nous répondons par e-mail.",
  },
  pt: {
    title: "Como funciona o pagamento",
    steps: [
      "Faça seu pedido. Você verá nossos dados bancários e o número do pedido.",
      "Transfira o valor total exato para nossa conta no Hana Bank e informe o número do pedido na descrição.",
      "Verificamos nossa conta, confirmamos seu pagamento por e-mail e então enviamos seu pedido.",
    ],
    fees: "Seu banco ou bancos intermediários podem cobrar taxas de transferência internacional.",
    seller: "Vendido por", regNo: "N.º de registro empresarial", refund: "Política de cancelamento e reembolso",
    support: "Dúvidas? Envie e-mail para", supportTail: "ou use o chat. Respondemos por e-mail.",
  },
  ja: {
    title: "お支払いの流れ",
    steps: [
      "ご注文を確定すると、振込先口座と注文番号が表示されます。",
      "ご注文合計額をハナ銀行の口座へお振込みください。振込メモに注文番号をご記入ください。",
      "当店で入金を確認し、メールでお知らせした後に発送いたします。",
    ],
    fees: "お客様の銀行や中継銀行で海外送金手数料がかかる場合があります。",
    seller: "販売者", regNo: "事業者登録番号", refund: "キャンセル・返金について",
    support: "ご質問は", supportTail: "またはチャットへ。メールでご返信します。",
  },
  ar: {
    title: "كيف يتم الدفع",
    steps: [
      "أكملي طلبك وسترين بيانات حسابنا البنكي ورقم الطلب.",
      "حوّلي المبلغ الإجمالي بالضبط إلى حسابنا في Hana Bank واكتبي رقم الطلب في ملاحظة التحويل.",
      "نتحقق من حسابنا ونؤكد الدفع عبر البريد الإلكتروني ثم نشحن طلبك.",
    ],
    fees: "قد يفرض بنكك أو البنوك الوسيطة رسومًا على التحويل الدولي.",
    seller: "البائع", regNo: "رقم السجل التجاري", refund: "سياسة الإلغاء والاسترداد",
    support: "لديك سؤال؟ راسلينا على", supportTail: "أو استخدمي الدردشة. نرد عبر البريد الإلكتروني.",
  },
};

// Explains the manual bank-transfer flow and who the seller is, shown on the checkout pages.
const PaymentTrustInfo = ({ showSteps = true }: { showSteps?: boolean }) => {
  const { language } = useLanguage();
  const site = useSiteSettings();
  const t = T[language] || T.en;
  return (
    <div className="border border-border bg-muted/30 p-4 md:p-5 space-y-3 text-sm">
      {showSteps && (
        <>
          <p className="flex items-center gap-2 text-xs font-sans font-bold tracking-[0.15em] uppercase"><ShieldCheck className="h-4 w-4" />{t.title}</p>
          <ol className="space-y-1.5 text-muted-foreground">
            {t.steps.map((step, i) => (
              <li key={i} className="flex gap-2"><span className="font-semibold text-foreground tabular-nums">{i + 1}.</span><span>{step}</span></li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">{t.fees}</p>
        </>
      )}
      <div className={`text-xs text-muted-foreground space-y-1 ${showSteps ? "border-t border-border pt-3" : ""}`}>
        {site.businessName && (
          <p>{t.seller} <strong className="text-foreground">{site.businessName}</strong>{site.businessNumber && ` · ${t.regNo} ${site.businessNumber}`}</p>
        )}
        <p>
          {t.support} <a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground underline underline-offset-2 break-all">{SUPPORT_EMAIL}</a> {t.supportTail}
        </p>
        <p><Link to="/qa" className="text-foreground underline underline-offset-2">{t.refund}</Link></p>
      </div>
    </div>
  );
};

export default PaymentTrustInfo;
