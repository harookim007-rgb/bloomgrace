export type SupportCategory = "product" | "order" | "shipping" | "return" | "payment" | "other";

export const SUPPORT_CATEGORIES: SupportCategory[] = ["product", "order", "shipping", "return", "payment", "other"];

export interface SupportText {
  title: string;
  subtitle: string;
  greeting: string;
  loginRequired: string;
  loginBtn: string;
  tabNew: string;
  tabHistory: string;
  stepCategory: string;
  cats: Record<SupportCategory, string>;
  stepOrder: string;
  noOrder: string;
  orderSkip: string;
  stepDetail: string;
  phone: string;
  phoneRequired: string;
  placeholder: string;
  send: string;
  sending: string;
  back: string;
  sent: string;
  error: string;
  emptyHistory: string;
  pending: string;
  answered: string;
  replyLabel: string;
  newInquiry: string;
}

export const supportTexts: Record<string, SupportText> = {
  en: {
    title: "Customer Support", subtitle: "We usually reply within a few hours",
    greeting: "Hello! What can we help you with today?",
    loginRequired: "Please sign in to send an inquiry so we can link it to your account and keep your history.",
    loginBtn: "Sign in with Google",
    tabNew: "New inquiry", tabHistory: "My inquiries",
    stepCategory: "1. Choose a topic",
    cats: { product: "Product", order: "Order", shipping: "Shipping", return: "Return / Exchange", payment: "Payment", other: "Other" },
    stepOrder: "2. Which order is this about?",
    noOrder: "No orders yet — continue without an order.",
    orderSkip: "Not about a specific order",
    stepDetail: "3. Tell us more",
    phone: "Mobile number (required)",
    phoneRequired: "Please enter your mobile number.",
    placeholder: "Write your message...",
    send: "Send", sending: "Sending...", back: "Back",
    sent: "Message sent! We'll reply by email and here.",
    error: "Failed to send. Please try again.",
    emptyHistory: "No inquiries yet.",
    pending: "Waiting for reply", answered: "Answered",
    replyLabel: "Bloom & Grace", newInquiry: "New inquiry",
  },
  es: {
    title: "Atención al Cliente", subtitle: "Respondemos en pocas horas",
    greeting: "¡Hola! ¿En qué podemos ayudarte?",
    loginRequired: "Inicia sesión para enviar una consulta y guardar tu historial.",
    loginBtn: "Entrar con Google",
    tabNew: "Nueva consulta", tabHistory: "Mis consultas",
    stepCategory: "1. Elige un tema",
    cats: { product: "Producto", order: "Pedido", shipping: "Envío", return: "Devolución", payment: "Pago", other: "Otro" },
    stepOrder: "2. ¿Sobre qué pedido?",
    noOrder: "Aún no tienes pedidos — continúa sin pedido.",
    orderSkip: "No es sobre un pedido",
    stepDetail: "3. Cuéntanos más",
    phone: "Móvil (obligatorio)",
    phoneRequired: "Introduce tu número de móvil.",
    placeholder: "Escribe tu mensaje...",
    send: "Enviar", sending: "Enviando...", back: "Atrás",
    sent: "¡Mensaje enviado! Te responderemos por correo y aquí.",
    error: "Error al enviar. Inténtalo de nuevo.",
    emptyHistory: "Aún no hay consultas.",
    pending: "Pendiente", answered: "Respondida",
    replyLabel: "Bloom & Grace", newInquiry: "Nueva consulta",
  },
  de: {
    title: "Kundenservice", subtitle: "Wir antworten in wenigen Stunden",
    greeting: "Hallo! Wie können wir helfen?",
    loginRequired: "Bitte melden Sie sich an, um eine Anfrage zu senden und Ihren Verlauf zu speichern.",
    loginBtn: "Mit Google anmelden",
    tabNew: "Neue Anfrage", tabHistory: "Meine Anfragen",
    stepCategory: "1. Thema wählen",
    cats: { product: "Produkt", order: "Bestellung", shipping: "Versand", return: "Rückgabe", payment: "Zahlung", other: "Sonstiges" },
    stepOrder: "2. Um welche Bestellung geht es?",
    noOrder: "Noch keine Bestellungen — ohne Bestellung fortfahren.",
    orderSkip: "Keine bestimmte Bestellung",
    stepDetail: "3. Ihre Nachricht",
    phone: "Mobilnummer (Pflicht)",
    phoneRequired: "Bitte Mobilnummer eingeben.",
    placeholder: "Nachricht eingeben...",
    send: "Senden", sending: "Wird gesendet...", back: "Zurück",
    sent: "Gesendet! Wir antworten per E-Mail und hier.",
    error: "Senden fehlgeschlagen. Bitte erneut versuchen.",
    emptyHistory: "Noch keine Anfragen.",
    pending: "Offen", answered: "Beantwortet",
    replyLabel: "Bloom & Grace", newInquiry: "Neue Anfrage",
  },
  fr: {
    title: "Service Client", subtitle: "Nous répondons en quelques heures",
    greeting: "Bonjour ! Comment pouvons-nous vous aider ?",
    loginRequired: "Connectez-vous pour envoyer une demande et conserver votre historique.",
    loginBtn: "Se connecter avec Google",
    tabNew: "Nouvelle demande", tabHistory: "Mes demandes",
    stepCategory: "1. Choisissez un sujet",
    cats: { product: "Produit", order: "Commande", shipping: "Livraison", return: "Retour", payment: "Paiement", other: "Autre" },
    stepOrder: "2. Quelle commande ?",
    noOrder: "Aucune commande — continuez sans commande.",
    orderSkip: "Pas une commande précise",
    stepDetail: "3. Votre message",
    phone: "Téléphone mobile (requis)",
    phoneRequired: "Veuillez saisir votre numéro de mobile.",
    placeholder: "Écrivez votre message...",
    send: "Envoyer", sending: "Envoi...", back: "Retour",
    sent: "Message envoyé ! Réponse par e-mail et ici.",
    error: "Échec de l'envoi. Veuillez réessayer.",
    emptyHistory: "Aucune demande.",
    pending: "En attente", answered: "Répondu",
    replyLabel: "Bloom & Grace", newInquiry: "Nouvelle demande",
  },
  pt: {
    title: "Atendimento ao Cliente", subtitle: "Respondemos em poucas horas",
    greeting: "Olá! Como podemos ajudar?",
    loginRequired: "Entre na sua conta para enviar uma dúvida e guardar o histórico.",
    loginBtn: "Entrar com Google",
    tabNew: "Nova dúvida", tabHistory: "Minhas dúvidas",
    stepCategory: "1. Escolha o assunto",
    cats: { product: "Produto", order: "Pedido", shipping: "Envio", return: "Devolução", payment: "Pagamento", other: "Outro" },
    stepOrder: "2. Sobre qual pedido?",
    noOrder: "Ainda sem pedidos — continue sem pedido.",
    orderSkip: "Não é sobre um pedido",
    stepDetail: "3. Conte-nos mais",
    phone: "Celular (obrigatório)",
    phoneRequired: "Informe seu número de celular.",
    placeholder: "Digite sua mensagem...",
    send: "Enviar", sending: "Enviando...", back: "Voltar",
    sent: "Enviado! Responderemos por e-mail e aqui.",
    error: "Falha ao enviar. Tente novamente.",
    emptyHistory: "Nenhuma dúvida ainda.",
    pending: "Aguardando", answered: "Respondida",
    replyLabel: "Bloom & Grace", newInquiry: "Nova dúvida",
  },
  ja: {
    title: "カスタマーサポート", subtitle: "通常数時間以内に返信します",
    greeting: "こんにちは！本日はどのようなご用件でしょうか？",
    loginRequired: "お問い合わせにはログインが必要です。履歴もご確認いただけます。",
    loginBtn: "Googleでログイン",
    tabNew: "新規お問い合わせ", tabHistory: "お問い合わせ履歴",
    stepCategory: "1. お問い合わせの種類",
    cats: { product: "商品", order: "注文", shipping: "配送", return: "返品・交換", payment: "お支払い", other: "その他" },
    stepOrder: "2. どのご注文についてですか？",
    noOrder: "ご注文履歴がありません — そのまま進めます。",
    orderSkip: "特定の注文ではない",
    stepDetail: "3. 内容をご入力ください",
    phone: "携帯番号（必須）",
    phoneRequired: "携帯番号をご入力ください。",
    placeholder: "メッセージを入力...",
    send: "送信", sending: "送信中...", back: "戻る",
    sent: "送信しました。メールとこちらでご返信します。",
    error: "送信に失敗しました。もう一度お試しください。",
    emptyHistory: "お問い合わせはまだありません。",
    pending: "回答待ち", answered: "回答済み",
    replyLabel: "Bloom & Grace", newInquiry: "新規お問い合わせ",
  },
  ar: {
    title: "دعم العملاء", subtitle: "نرد عادة خلال بضع ساعات",
    greeting: "مرحباً! كيف يمكننا مساعدتك؟",
    loginRequired: "يرجى تسجيل الدخول لإرسال استفسار وحفظ سجلك.",
    loginBtn: "تسجيل الدخول عبر Google",
    tabNew: "استفسار جديد", tabHistory: "استفساراتي",
    stepCategory: "١. اختر الموضوع",
    cats: { product: "المنتج", order: "الطلب", shipping: "الشحن", return: "الإرجاع", payment: "الدفع", other: "أخرى" },
    stepOrder: "٢. عن أي طلب؟",
    noOrder: "لا توجد طلبات بعد — تابع بدون طلب.",
    orderSkip: "ليس عن طلب محدد",
    stepDetail: "٣. أخبرنا المزيد",
    phone: "رقم الجوال (مطلوب)",
    phoneRequired: "يرجى إدخال رقم الجوال.",
    placeholder: "اكتب رسالتك...",
    send: "إرسال", sending: "جارٍ الإرسال...", back: "رجوع",
    sent: "تم الإرسال! سنرد عبر البريد وهنا.",
    error: "فشل الإرسال. حاول مرة أخرى.",
    emptyHistory: "لا توجد استفسارات.",
    pending: "بانتظار الرد", answered: "تم الرد",
    replyLabel: "Bloom & Grace", newInquiry: "استفسار جديد",
  },
};
