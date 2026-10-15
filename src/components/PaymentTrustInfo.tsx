import { Info } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const T: Record<Language, string> = {
  en: "The depositor name must match the name on your order so we can find your payment.",
  es: "El nombre del titular de la transferencia debe coincidir con el nombre del pedido para poder identificar tu pago.",
  de: "Der Name des Einzahlers muss mit dem Namen in Ihrer Bestellung übereinstimmen, damit wir Ihre Zahlung zuordnen können.",
  fr: "Le nom de l'émetteur du virement doit correspondre au nom de la commande pour que nous puissions identifier votre paiement.",
  pt: "O nome do depositante deve ser igual ao nome do pedido para que possamos identificar o seu pagamento.",
  ja: "ご入金の際は、ご注文者様と同じお名前でお振込みください。お名前で入金を確認いたします。",
  ar: "يجب أن يطابق اسم المُحوِّل الاسم الموجود في الطلب حتى نتمكن من التحقق من دفعتك.",
};

// Bank transfers are matched to orders by name, so the transfer must be sent in the orderer's name.
const PaymentTrustInfo = () => {
  const { language } = useLanguage();
  return (
    <p className="flex items-start gap-2 border border-border bg-muted/30 p-3 text-sm">
      <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <span>{T[language] || T.en}</span>
    </p>
  );
};

export default PaymentTrustInfo;
