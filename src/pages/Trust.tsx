import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

type TrustDict = {
  title: string;
  intro: string;
  auth: string; authBody: string;
  host: string; hostBody: string;
  collect: string; collectItems: string[];
  use: string; useBody: string;
  access: string; accessBody: string;
  cookies: string; cookiesBody: string;
  requests: string; requestsBody: string;
  contactLink: string;
  disclaimer: string;
};

const T: Record<string, TrustDict> = {
  en: {
    title: "Trust & Privacy",
    intro: "This page is maintained by Bloom & Grace to answer common security and privacy questions about our store.",
    auth: "Account & Authentication",
    authBody: "Customers sign in with Google. Sessions are issued by our backend provider. Administrator areas require an additional one-time passcode.",
    host: "Hosting & Platform",
    hostBody: "The storefront uses a managed Postgres database with row-level-security policies. All connections are encrypted in transit (HTTPS/TLS).",
    collect: "Data We Collect",
    collectItems: [
      "Account profile (name, email, phone) you provide at sign-up.",
      "Shipping address and order history needed to fulfil purchases.",
      "Product reviews and customer-support messages you submit.",
      "Optional preferences such as language and wishlist.",
    ],
    use: "How We Use Your Data",
    useBody: "We use your information to process orders, deliver products, answer your inquiries, issue loyalty points, and improve the shopping experience. We do not sell personal information.",
    access: "Access Controls",
    accessBody: "Customer records are protected by per-user row-level-security rules so that only the account owner (and authorised administrators) can read or change their data.",
    cookies: "Cookies",
    cookiesBody: "We use a minimal set of cookies and local-storage entries to keep you signed in and to remember your language and cart.",
    requests: "Your Requests",
    requestsBody: "To access, correct or delete your personal data, or to report a security concern, contact us at",
    contactLink: "our contact page",
    disclaimer: "Compliance commitments, audits, or regulatory certifications are not claimed on this page unless explicitly stated in writing by Bloom & Grace.",
  },
  es: {
    title: "Confianza y Privacidad",
    intro: "Esta página es mantenida por Bloom & Grace para responder preguntas comunes de seguridad y privacidad sobre nuestra tienda.",
    auth: "Cuenta y Autenticación",
    authBody: "Los clientes inician sesión con Google. Las áreas de administrador requieren un código único adicional.",
    host: "Hospedaje y Plataforma",
    hostBody: "La tienda usa una base de datos Postgres administrada con políticas de seguridad a nivel de fila. Todas las conexiones están cifradas (HTTPS/TLS).",
    collect: "Datos que Recopilamos",
    collectItems: [
      "Perfil de cuenta (nombre, correo, teléfono) que proporcionas al registrarte.",
      "Dirección de envío e historial de pedidos para procesar tus compras.",
      "Reseñas de productos y mensajes de soporte que envías.",
      "Preferencias opcionales como idioma y lista de deseos.",
    ],
    use: "Cómo Usamos Tus Datos",
    useBody: "Usamos tu información para procesar pedidos, entregar productos, responder consultas, otorgar puntos y mejorar tu experiencia. No vendemos información personal.",
    access: "Controles de Acceso",
    accessBody: "Los registros están protegidos por reglas de seguridad a nivel de fila por usuario, para que solo el propietario (y administradores autorizados) puedan acceder.",
    cookies: "Cookies",
    cookiesBody: "Usamos un conjunto mínimo de cookies y almacenamiento local para mantenerte conectado y recordar tu idioma y carrito.",
    requests: "Tus Solicitudes",
    requestsBody: "Para acceder, corregir o eliminar tus datos, o reportar un problema de seguridad, contáctanos en",
    contactLink: "nuestra página de contacto",
    disclaimer: "No se reclaman certificaciones regulatorias en esta página salvo declaración escrita explícita de Bloom & Grace.",
  },
  de: {
    title: "Vertrauen & Datenschutz",
    intro: "Diese Seite wird von Bloom & Grace gepflegt und beantwortet gängige Sicherheits- und Datenschutzfragen zu unserem Shop.",
    auth: "Konto & Authentifizierung",
    authBody: "Kunden melden sich mit Google an. Admin-Bereiche erfordern einen zusätzlichen Einmalcode.",
    host: "Hosting & Plattform",
    hostBody: "Der Shop nutzt eine verwaltete Postgres-Datenbank mit Row-Level-Security-Richtlinien. Alle Verbindungen sind verschlüsselt (HTTPS/TLS).",
    collect: "Erhobene Daten",
    collectItems: [
      "Kontoprofil (Name, E-Mail, Telefon), das Sie bei der Registrierung angeben.",
      "Lieferadresse und Bestellverlauf zur Abwicklung Ihrer Bestellungen.",
      "Produktbewertungen und Support-Nachrichten, die Sie senden.",
      "Optionale Einstellungen wie Sprache und Wunschliste.",
    ],
    use: "Wie wir Ihre Daten verwenden",
    useBody: "Wir verwenden Ihre Informationen zur Bestellabwicklung, Lieferung, Beantwortung von Anfragen und Verbesserung des Einkaufserlebnisses. Wir verkaufen keine personenbezogenen Daten.",
    access: "Zugriffskontrollen",
    accessBody: "Kundendaten sind durch nutzerbezogene Row-Level-Security geschützt, sodass nur der Kontoinhaber (und autorisierte Admins) Zugriff haben.",
    cookies: "Cookies",
    cookiesBody: "Wir verwenden minimale Cookies und Local-Storage, um Sie angemeldet zu halten und Sprache/Warenkorb zu speichern.",
    requests: "Ihre Anfragen",
    requestsBody: "Zum Zugriff, zur Korrektur oder Löschung Ihrer Daten oder zur Meldung von Sicherheitsbedenken kontaktieren Sie uns über",
    contactLink: "unsere Kontaktseite",
    disclaimer: "Auf dieser Seite werden keine Zertifizierungen beansprucht, sofern nicht ausdrücklich schriftlich von Bloom & Grace erklärt.",
  },
  fr: {
    title: "Confiance & Confidentialité",
    intro: "Cette page est maintenue par Bloom & Grace pour répondre aux questions courantes de sécurité et de confidentialité.",
    auth: "Compte & Authentification",
    authBody: "Les clients se connectent avec Google. Les zones administrateur nécessitent un code à usage unique supplémentaire.",
    host: "Hébergement & Plateforme",
    hostBody: "La boutique utilise une base Postgres managée avec sécurité au niveau des lignes. Toutes les connexions sont chiffrées (HTTPS/TLS).",
    collect: "Données Collectées",
    collectItems: [
      "Profil de compte (nom, e-mail, téléphone) fourni à l'inscription.",
      "Adresse de livraison et historique pour traiter vos commandes.",
      "Avis sur les produits et messages au support que vous envoyez.",
      "Préférences optionnelles comme la langue et la liste de souhaits.",
    ],
    use: "Utilisation de Vos Données",
    useBody: "Nous utilisons vos informations pour traiter les commandes, livrer les produits, répondre aux demandes, attribuer des points et améliorer l'expérience. Nous ne vendons aucune donnée personnelle.",
    access: "Contrôles d'Accès",
    accessBody: "Les données client sont protégées par des règles de sécurité par utilisateur, seul le propriétaire (et les admins autorisés) y accèdent.",
    cookies: "Cookies",
    cookiesBody: "Nous utilisons un minimum de cookies et de stockage local pour vous garder connecté et mémoriser langue et panier.",
    requests: "Vos Demandes",
    requestsBody: "Pour accéder, corriger ou supprimer vos données, ou signaler un problème, contactez-nous via",
    contactLink: "notre page contact",
    disclaimer: "Aucune certification réglementaire n'est revendiquée sur cette page sauf déclaration écrite explicite de Bloom & Grace.",
  },
  pt: {
    title: "Confiança e Privacidade",
    intro: "Esta página é mantida pela Bloom & Grace para responder a perguntas comuns de segurança e privacidade.",
    auth: "Conta e Autenticação",
    authBody: "Clientes entram com Google. Áreas de administrador exigem código único adicional.",
    host: "Hospedagem e Plataforma",
    hostBody: "A loja usa banco Postgres gerenciado com políticas de segurança por linha. Todas as conexões são criptografadas (HTTPS/TLS).",
    collect: "Dados que Coletamos",
    collectItems: [
      "Perfil da conta (nome, e-mail, telefone) fornecido no cadastro.",
      "Endereço de entrega e histórico de pedidos para processar compras.",
      "Avaliações de produtos e mensagens ao suporte enviadas por você.",
      "Preferências opcionais como idioma e lista de desejos.",
    ],
    use: "Como Usamos Seus Dados",
    useBody: "Usamos suas informações para processar pedidos, entregar produtos, responder dúvidas, conceder pontos e melhorar a experiência. Não vendemos dados pessoais.",
    access: "Controles de Acesso",
    accessBody: "Os registros do cliente são protegidos por regras de segurança por usuário; apenas o titular (e admins autorizados) podem acessar.",
    cookies: "Cookies",
    cookiesBody: "Usamos um conjunto mínimo de cookies e armazenamento local para mantê-lo conectado e lembrar idioma e carrinho.",
    requests: "Suas Solicitações",
    requestsBody: "Para acessar, corrigir ou excluir seus dados, ou reportar problemas de segurança, fale conosco em",
    contactLink: "nossa página de contato",
    disclaimer: "Nenhuma certificação regulatória é reivindicada nesta página, salvo declaração escrita expressa da Bloom & Grace.",
  },
  ja: {
    title: "信頼とプライバシー",
    intro: "このページは Bloom & Grace がストアに関するセキュリティとプライバシーの一般的な質問に答えるために維持しています。",
    auth: "アカウントと認証",
    authBody: "お客様は Google でログインします。管理者エリアは追加のワンタイムパスコードが必要です。",
    host: "ホスティングとプラットフォーム",
    hostBody: "ストアは行レベルセキュリティを備えたマネージド Postgres を使用しています。すべての通信は暗号化されています（HTTPS/TLS）。",
    collect: "収集する情報",
    collectItems: [
      "登録時にご提供いただくアカウント情報（氏名、メール、電話）。",
      "ご注文を履行するための配送先住所と注文履歴。",
      "投稿された商品レビューやサポートメッセージ。",
      "言語やウィッシュリストなど任意の設定。",
    ],
    use: "データの利用方法",
    useBody: "ご注文処理、配送、お問い合わせ対応、ポイント付与、購買体験の改善に利用します。個人情報は販売しません。",
    access: "アクセス制御",
    accessBody: "お客様データはユーザー単位の行レベルセキュリティで保護され、本人と権限を持つ管理者のみアクセスできます。",
    cookies: "Cookie",
    cookiesBody: "ログイン状態、言語、カートを記憶するために最小限の Cookie とローカルストレージを使用します。",
    requests: "お問い合わせ",
    requestsBody: "個人情報へのアクセス・訂正・削除、セキュリティ報告は次のページからご連絡ください：",
    contactLink: "お問い合わせページ",
    disclaimer: "本ページに明示的に記載されない限り、規制認証は主張しません。",
  },
  ar: {
    title: "الثقة والخصوصية",
    intro: "تتولى Bloom & Grace صيانة هذه الصفحة للإجابة عن أسئلة الأمان والخصوصية الشائعة المتعلقة بمتجرنا.",
    auth: "الحساب والمصادقة",
    authBody: "يسجل العملاء الدخول عبر Google. تتطلب مناطق المسؤول رمزًا إضافيًا لمرة واحدة.",
    host: "الاستضافة والمنصة",
    hostBody: "يستخدم المتجر قاعدة بيانات Postgres مُدارة مع سياسات أمان على مستوى الصفوف. جميع الاتصالات مشفرة (HTTPS/TLS).",
    collect: "البيانات التي نجمعها",
    collectItems: [
      "بيانات الحساب (الاسم، البريد، الهاتف) عند التسجيل.",
      "عنوان الشحن وسجل الطلبات لتنفيذ المشتريات.",
      "مراجعات المنتجات ورسائل الدعم التي ترسلها.",
      "تفضيلات اختيارية مثل اللغة وقائمة الأمنيات.",
    ],
    use: "كيف نستخدم بياناتك",
    useBody: "نستخدم معلوماتك لمعالجة الطلبات، التوصيل، الإجابة على استفساراتك، منح النقاط، وتحسين تجربة التسوق. لا نبيع المعلومات الشخصية.",
    access: "ضوابط الوصول",
    accessBody: "بيانات العملاء محمية بقواعد أمان على مستوى الصفوف، بحيث لا يصل إليها سوى صاحب الحساب والمسؤولين المخولين.",
    cookies: "ملفات تعريف الارتباط",
    cookiesBody: "نستخدم الحد الأدنى من ملفات تعريف الارتباط والتخزين المحلي لإبقائك مسجلاً وتذكر اللغة والسلة.",
    requests: "طلباتك",
    requestsBody: "للوصول إلى بياناتك أو تصحيحها أو حذفها أو الإبلاغ عن مشكلة أمنية، تواصل معنا عبر",
    contactLink: "صفحة التواصل",
    disclaimer: "لا يتم ادعاء أي شهادات تنظيمية على هذه الصفحة ما لم تصرح بذلك Bloom & Grace كتابيًا.",
  },
};

const Trust = () => {
  const { language } = useLanguage();
  const d = T[language] || T.en;
  return (
    <div className="min-h-dvh flex flex-col">
      <SEO
        title="Trust & Privacy | Bloom & Grace"
        description="How Bloom & Grace protects your account, order data and privacy — hosting, security and data handling practices."
        path="/trust"
      />
      <Navigation />
      <main className="flex-1 container px-4 md:px-6 lg:px-8 py-12 md:py-20 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">{d.title}</h1>
        <p className="text-sm text-muted-foreground mb-10">{d.intro}</p>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">{d.auth}</h2>
          <p className="text-sm leading-relaxed">{d.authBody}</p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">{d.host}</h2>
          <p className="text-sm leading-relaxed">{d.hostBody}</p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">{d.collect}</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {d.collectItems.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">{d.use}</h2>
          <p className="text-sm leading-relaxed">{d.useBody}</p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">{d.access}</h2>
          <p className="text-sm leading-relaxed">{d.accessBody}</p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">{d.cookies}</h2>
          <p className="text-sm leading-relaxed">{d.cookiesBody}</p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">{d.requests}</h2>
          <p className="text-sm leading-relaxed">
            {d.requestsBody} <a className="underline" href="/contact">{d.contactLink}</a>.
          </p>
        </section>

        <p className="text-xs text-muted-foreground mt-12">{d.disclaimer}</p>
      </main>
      <Footer />
    </div>
  );
};

export default Trust;
