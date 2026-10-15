// Content of the "Find Your Perfect Match" consultation in every storefront language:
// the skin quiz, the skin types it can return, the makeup looks and the scalp types.
// The IDs are the tags admins pick per product (상품 편집 > 뷰티 상담 추천).

export type SkinTypeId =
  | "extremely_dry" | "dry" | "normal" | "oily" | "combination" | "sensitive" | "dehydrated_oily" | "acne_prone";
export type LookId = "natural" | "dewy" | "soft_matte" | "soft_glam" | "romantic" | "bold_glam";
export type ScalpId = "oily_scalp" | "dry_scalp" | "normal_scalp" | "sensitive_scalp" | "combination_scalp";

export const SKIN_TYPE_IDS: SkinTypeId[] = ["extremely_dry", "dry", "normal", "oily", "combination", "sensitive", "dehydrated_oily", "acne_prone"];
export const LOOK_IDS: LookId[] = ["natural", "dewy", "soft_matte", "soft_glam", "romantic", "bold_glam"];
export const SCALP_IDS: ScalpId[] = ["oily_scalp", "dry_scalp", "normal_scalp", "sensitive_scalp", "combination_scalp"];

// Face areas the diagram highlights.
export type Zone = "tzone" | "cheeks" | "full" | "spots" | "redness";

// Which face areas to show for each skin type result.
export const SKIN_ZONES: Record<SkinTypeId, { oily?: Zone[]; dry?: Zone[]; sensitive?: boolean; spots?: boolean; balanced?: boolean }> = {
  extremely_dry: { dry: ["full"] },
  dry: { dry: ["cheeks", "tzone"] },
  normal: { balanced: true },
  oily: { oily: ["full"] },
  combination: { oily: ["tzone"], dry: ["cheeks"] },
  sensitive: { sensitive: true },
  dehydrated_oily: { oily: ["tzone"], dry: ["cheeks"] },
  acne_prone: { oily: ["tzone"], spots: true },
};

// Colour swatches shown on each makeup look card.
export const LOOK_SWATCHES: Record<LookId, string[]> = {
  natural: ["#ead7c3", "#d9b8a0", "#c99a86"],
  dewy: ["#f6e2d6", "#f3c9b4", "#fbefe6"],
  soft_matte: ["#d8b9a6", "#b98c7b", "#9e6f63"],
  soft_glam: ["#c79a8a", "#9b6b6b", "#7a4f4f"],
  romantic: ["#f6c4cf", "#f3a7a6", "#f8d2b9"],
  bold_glam: ["#8e1b2c", "#3b2a2a", "#111111"],
};

type Answer = { label: string; points: Partial<Record<SkinTypeId, number>> };
type Question = { text: string; zone: Zone; answers: Answer[] };

// Answer points are the same in every language; only the wording differs.
const POINTS: Partial<Record<SkinTypeId, number>>[][] = [
  [{ extremely_dry: 3, dry: 1 }, { dry: 3, extremely_dry: 1 }, { normal: 3 }, { oily: 3 }, { combination: 3 }, { dehydrated_oily: 3, combination: 1 }],
  [{ extremely_dry: 2, dry: 1 }, { normal: 2, dry: 1 }, { normal: 1, combination: 1, dehydrated_oily: 1 }, { oily: 2, combination: 1, dehydrated_oily: 1 }],
  [{ extremely_dry: 2 }, { dry: 2, combination: 1, dehydrated_oily: 1 }, { normal: 2 }, { oily: 2 }],
  [{}, {}, {}],
  [{}, {}, {}],
];
const ZONES: Zone[] = ["full", "tzone", "cheeks", "spots", "redness"];

// "Often" breakouts or reactions decide the type on their own; otherwise the points do.
export const diagnoseSkin = (answers: number[]): SkinTypeId => {
  if (answers[3] === 2) return "acne_prone";
  if (answers[4] === 2) return "sensitive";
  const score: Partial<Record<SkinTypeId, number>> = {};
  answers.forEach((a, q) => Object.entries(POINTS[q]?.[a] || {}).forEach(([k, v]) => { score[k as SkinTypeId] = (score[k as SkinTypeId] || 0) + (v || 0); }));
  const order: SkinTypeId[] = ["dehydrated_oily", "combination", "extremely_dry", "dry", "oily", "normal"];
  return order.reduce((best, id) => ((score[id] || 0) > (score[best] || 0) ? id : best), "normal" as SkinTypeId);
};

type Texts = {
  ui: {
    title: string; ask: string; skin: string; skinSub: string; makeup: string; makeupSub: string; hair: string; hairSub: string;
    skinIntro: string; skinIntroSub: string; start: string; knowType: string; pickType: string; question: string; of: string;
    back: string; startOver: string; close: string; dontShowToday: string; yourSkin: string; yourLook: string; yourScalp: string;
    lookAsk: string; scalpAsk: string; recommended: string; routine: string; none: string; viewAll: string; view: string;
    oilyArea: string; dryArea: string; sensitiveArea: string; breakouts: string; balanced: string; seeProducts: string;
  };
  questions: string[][]; // [question, ...answers]
  skin: Record<SkinTypeId, [string, string]>;
  looks: Record<LookId, [string, string]>;
  scalp: Record<ScalpId, [string, string]>;
};

const LOOK_NAMES: Record<LookId, string> = {
  natural: "Natural Makeup", dewy: "Dewy & Glowy", soft_matte: "Soft Matte", soft_glam: "Soft Glam", romantic: "Romantic", bold_glam: "Bold & Glam",
};
const looks = (d: Record<LookId, string>) =>
  Object.fromEntries(LOOK_IDS.map(id => [id, [LOOK_NAMES[id], d[id]]])) as Record<LookId, [string, string]>;

export const CONSULT_TEXTS: Record<string, Texts> = {
  en: {
    ui: {
      title: "Find Your Perfect Match", ask: "What are you looking for?",
      skin: "Skincare", skinSub: "Diagnose your skin type", makeup: "Makeup", makeupSub: "Find your look", hair: "Hair & Scalp", hairSub: "Check your scalp type",
      skinIntro: "Let's quickly diagnose your skin type!", skinIntroSub: "Answer 5 short questions.", start: "Start", knowType: "I already know my skin type",
      pickType: "Choose your skin type", question: "Question", of: "of", back: "Back", startOver: "Start over", close: "Close", dontShowToday: "Don't show again today",
      yourSkin: "Your skin type", yourLook: "Your look", yourScalp: "Your scalp type", lookAsk: "Which makeup look do you love?", scalpAsk: "What is your scalp like?",
      recommended: "Recommended for you", routine: "Use in this order", none: "We're preparing products for this. Please browse all products in the meantime.",
      viewAll: "View all products", view: "View", oilyArea: "Oily areas", dryArea: "Dry areas", sensitiveArea: "Sensitive areas", breakouts: "Breakouts", balanced: "Balanced",
      seeProducts: "See my products",
    },
    questions: [
      ["A few hours after washing your face, with nothing applied, how does your skin feel?", "Very tight and flaky", "Tight and a little dry", "Comfortable", "Shiny all over", "Shiny forehead and nose, dry cheeks", "Oily on the surface but tight inside"],
      ["By midday, how does your T-zone (forehead and nose) look?", "Dry or flaky", "Matte", "A little shiny", "Very oily"],
      ["And your cheeks?", "Rough or flaky", "Tight", "Comfortable", "Shiny"],
      ["How often do you get breakouts?", "Rarely", "Sometimes", "Often"],
      ["How does your skin react to new products or weather changes?", "It rarely reacts", "It sometimes turns red", "It often gets red, itchy or stings"],
    ],
    skin: {
      extremely_dry: ["Extremely Dry Skin", "Very dry skin that flakes easily."],
      dry: ["Dry Skin", "Lacks oil and moisture and often feels tight."],
      normal: ["Normal Skin", "Oil and moisture are fairly well balanced."],
      oily: ["Oily Skin", "Oily and shiny all over the face."],
      combination: ["Combination Skin", "Different areas of the face behave differently."],
      sensitive: ["Sensitive Skin", "Turns red easily and reacts to irritation."],
      dehydrated_oily: ["Dehydrated Oily Skin", "Oily on the surface but dry underneath."],
      acne_prone: ["Acne-Prone Skin", "Pimples and breakouts appear often."],
    },
    looks: looks({ natural: "Clean, natural everyday makeup", dewy: "Moist, radiant makeup", soft_matte: "Smooth, velvety finish", soft_glam: "Polished and defined", romantic: "Lovely pink and peach tones", bold_glam: "Intense, glamorous makeup" }),
    scalp: {
      oily_scalp: ["Oily Scalp", "Produces a lot of sebum and gets greasy quickly."],
      dry_scalp: ["Dry Scalp", "Feels dry and tight, with flaking."],
      normal_scalp: ["Normal Scalp", "Oil and moisture are fairly balanced."],
      sensitive_scalp: ["Sensitive Scalp", "Itches or gets irritated easily."],
      combination_scalp: ["Combination Scalp", "Oily in some areas and dry in others."],
    },
  },
  es: {
    ui: {
      title: "Encuentra tu match perfecto", ask: "¿Qué estás buscando?",
      skin: "Cuidado facial", skinSub: "Descubre tu tipo de piel", makeup: "Maquillaje", makeupSub: "Encuentra tu look", hair: "Cabello y cuero cabelludo", hairSub: "Conoce tu tipo de cuero cabelludo",
      skinIntro: "¡Vamos a descubrir tu tipo de piel!", skinIntroSub: "Responde 5 preguntas cortas.", start: "Empezar", knowType: "Ya conozco mi tipo de piel",
      pickType: "Elige tu tipo de piel", question: "Pregunta", of: "de", back: "Atrás", startOver: "Empezar de nuevo", close: "Cerrar", dontShowToday: "No mostrar más hoy",
      yourSkin: "Tu tipo de piel", yourLook: "Tu look", yourScalp: "Tu tipo de cuero cabelludo", lookAsk: "¿Qué look de maquillaje te encanta?", scalpAsk: "¿Cómo es tu cuero cabelludo?",
      recommended: "Recomendado para ti", routine: "Úsalos en este orden", none: "Estamos preparando productos para esto. Mientras tanto, explora todos los productos.",
      viewAll: "Ver todos los productos", view: "Ver", oilyArea: "Zonas grasas", dryArea: "Zonas secas", sensitiveArea: "Zonas sensibles", breakouts: "Granitos", balanced: "Equilibrada",
      seeProducts: "Ver mis productos",
    },
    questions: [
      ["Unas horas después de lavarte la cara, sin aplicar nada, ¿cómo sientes la piel?", "Muy tirante y con descamación", "Tirante y algo seca", "Cómoda", "Brillante en toda la cara", "Frente y nariz brillantes, mejillas secas", "Grasa por fuera pero tirante por dentro"],
      ["A mediodía, ¿cómo está tu zona T (frente y nariz)?", "Seca o con descamación", "Mate", "Un poco brillante", "Muy grasa"],
      ["¿Y tus mejillas?", "Ásperas o con descamación", "Tirantes", "Cómodas", "Brillantes"],
      ["¿Con qué frecuencia te salen granitos?", "Rara vez", "A veces", "A menudo"],
      ["¿Cómo reacciona tu piel a productos nuevos o cambios de clima?", "Casi nunca reacciona", "A veces se enrojece", "A menudo se enrojece, pica o arde"],
    ],
    skin: {
      extremely_dry: ["Piel extremadamente seca", "Muy seca y con descamación frecuente."],
      dry: ["Piel seca", "Le falta grasa e hidratación y suele tirar."],
      normal: ["Piel normal", "Grasa e hidratación bastante equilibradas."],
      oily: ["Piel grasa", "Grasa y brillante en todo el rostro."],
      combination: ["Piel mixta", "Cada zona del rostro se comporta distinto."],
      sensitive: ["Piel sensible", "Se enrojece con facilidad y reacciona a la irritación."],
      dehydrated_oily: ["Piel grasa deshidratada", "Grasa en la superficie pero seca por dentro."],
      acne_prone: ["Piel con tendencia acneica", "Aparecen granitos y brotes con frecuencia."],
    },
    looks: looks({ natural: "Maquillaje diario limpio y natural", dewy: "Maquillaje jugoso y luminoso", soft_matte: "Acabado suave y aterciopelado", soft_glam: "Elegante y definido", romantic: "Tonos rosa y melocotón", bold_glam: "Maquillaje intenso y glamuroso" }),
    scalp: {
      oily_scalp: ["Cuero cabelludo graso", "Produce mucho sebo y se engrasa rápido."],
      dry_scalp: ["Cuero cabelludo seco", "Se siente seco y tirante, con descamación."],
      normal_scalp: ["Cuero cabelludo normal", "Grasa e hidratación bastante equilibradas."],
      sensitive_scalp: ["Cuero cabelludo sensible", "Pica o se irrita con facilidad."],
      combination_scalp: ["Cuero cabelludo mixto", "Graso en unas zonas y seco en otras."],
    },
  },
  de: {
    ui: {
      title: "Finde dein perfektes Match", ask: "Wonach suchst du?",
      skin: "Hautpflege", skinSub: "Hauttyp bestimmen", makeup: "Make-up", makeupSub: "Deinen Look finden", hair: "Haar & Kopfhaut", hairSub: "Kopfhauttyp prüfen",
      skinIntro: "Lass uns schnell deinen Hauttyp bestimmen!", skinIntroSub: "Beantworte 5 kurze Fragen.", start: "Starten", knowType: "Ich kenne meinen Hauttyp schon",
      pickType: "Wähle deinen Hauttyp", question: "Frage", of: "von", back: "Zurück", startOver: "Neu starten", close: "Schließen", dontShowToday: "Heute nicht mehr anzeigen",
      yourSkin: "Dein Hauttyp", yourLook: "Dein Look", yourScalp: "Dein Kopfhauttyp", lookAsk: "Welcher Make-up-Look gefällt dir?", scalpAsk: "Wie ist deine Kopfhaut?",
      recommended: "Für dich empfohlen", routine: "In dieser Reihenfolge anwenden", none: "Wir bereiten passende Produkte vor. Stöbere bis dahin in allen Produkten.",
      viewAll: "Alle Produkte ansehen", view: "Ansehen", oilyArea: "Fettige Zonen", dryArea: "Trockene Zonen", sensitiveArea: "Empfindliche Zonen", breakouts: "Unreinheiten", balanced: "Ausgeglichen",
      seeProducts: "Meine Produkte ansehen",
    },
    questions: [
      ["Wie fühlt sich deine Haut ein paar Stunden nach dem Waschen an, ohne Pflege?", "Sehr gespannt und schuppig", "Gespannt und etwas trocken", "Angenehm", "Überall glänzend", "Stirn und Nase glänzen, Wangen trocken", "Außen fettig, innen gespannt"],
      ["Wie sieht deine T-Zone (Stirn und Nase) mittags aus?", "Trocken oder schuppig", "Matt", "Leicht glänzend", "Sehr fettig"],
      ["Und deine Wangen?", "Rau oder schuppig", "Gespannt", "Angenehm", "Glänzend"],
      ["Wie oft hast du Unreinheiten?", "Selten", "Manchmal", "Oft"],
      ["Wie reagiert deine Haut auf neue Produkte oder Wetterwechsel?", "Kaum", "Manchmal gerötet", "Oft gerötet, juckend oder brennend"],
    ],
    skin: {
      extremely_dry: ["Sehr trockene Haut", "Sehr trocken und schuppt leicht."],
      dry: ["Trockene Haut", "Fehlt an Fett und Feuchtigkeit, spannt oft."],
      normal: ["Normale Haut", "Fett und Feuchtigkeit sind ziemlich ausgeglichen."],
      oily: ["Fettige Haut", "Im ganzen Gesicht fettig und glänzend."],
      combination: ["Mischhaut", "Die Gesichtsbereiche verhalten sich unterschiedlich."],
      sensitive: ["Empfindliche Haut", "Rötet sich leicht und reagiert auf Reize."],
      dehydrated_oily: ["Feuchtigkeitsarme fettige Haut", "Oberflächlich fettig, darunter trocken."],
      acne_prone: ["Zu Unreinheiten neigende Haut", "Pickel und Unreinheiten treten häufig auf."],
    },
    looks: looks({ natural: "Sauberes, natürliches Alltags-Make-up", dewy: "Frisches, strahlendes Make-up", soft_matte: "Glattes, samtiges Finish", soft_glam: "Elegant und definiert", romantic: "Liebliche Rosé- und Pfirsichtöne", bold_glam: "Intensives, glamouröses Make-up" }),
    scalp: {
      oily_scalp: ["Fettige Kopfhaut", "Viel Talg, wird schnell fettig."],
      dry_scalp: ["Trockene Kopfhaut", "Trocken und gespannt, mit Schuppen."],
      normal_scalp: ["Normale Kopfhaut", "Fett und Feuchtigkeit sind ziemlich ausgeglichen."],
      sensitive_scalp: ["Empfindliche Kopfhaut", "Juckt oder reagiert leicht gereizt."],
      combination_scalp: ["Mischkopfhaut", "Stellenweise fettig, stellenweise trocken."],
    },
  },
  fr: {
    ui: {
      title: "Trouvez votre match parfait", ask: "Que recherchez-vous ?",
      skin: "Soin du visage", skinSub: "Diagnostiquer votre type de peau", makeup: "Maquillage", makeupSub: "Trouver votre look", hair: "Cheveux & cuir chevelu", hairSub: "Connaître votre cuir chevelu",
      skinIntro: "Diagnostiquons rapidement votre type de peau !", skinIntroSub: "Répondez à 5 courtes questions.", start: "Commencer", knowType: "Je connais déjà mon type de peau",
      pickType: "Choisissez votre type de peau", question: "Question", of: "sur", back: "Retour", startOver: "Recommencer", close: "Fermer", dontShowToday: "Ne plus afficher aujourd'hui",
      yourSkin: "Votre type de peau", yourLook: "Votre look", yourScalp: "Votre cuir chevelu", lookAsk: "Quel look maquillage aimez-vous ?", scalpAsk: "Comment est votre cuir chevelu ?",
      recommended: "Recommandé pour vous", routine: "À utiliser dans cet ordre", none: "Nous préparons des produits pour cela. En attendant, découvrez tous nos produits.",
      viewAll: "Voir tous les produits", view: "Voir", oilyArea: "Zones grasses", dryArea: "Zones sèches", sensitiveArea: "Zones sensibles", breakouts: "Imperfections", balanced: "Équilibrée",
      seeProducts: "Voir mes produits",
    },
    questions: [
      ["Quelques heures après vous être lavé le visage, sans rien appliquer, comment est votre peau ?", "Très tiraillée et qui pèle", "Tiraillée et un peu sèche", "Confortable", "Brillante partout", "Front et nez brillants, joues sèches", "Grasse en surface mais tiraillée en profondeur"],
      ["À midi, comment est votre zone T (front et nez) ?", "Sèche ou qui pèle", "Mate", "Un peu brillante", "Très grasse"],
      ["Et vos joues ?", "Rugueuses ou qui pèlent", "Tiraillées", "Confortables", "Brillantes"],
      ["À quelle fréquence avez-vous des boutons ?", "Rarement", "Parfois", "Souvent"],
      ["Comment votre peau réagit-elle aux nouveaux produits ou aux changements de temps ?", "Elle réagit rarement", "Elle rougit parfois", "Elle rougit, démange ou picote souvent"],
    ],
    skin: {
      extremely_dry: ["Peau très sèche", "Très sèche et pèle facilement."],
      dry: ["Peau sèche", "Manque de sébum et d'hydratation, tiraille souvent."],
      normal: ["Peau normale", "Sébum et hydratation plutôt équilibrés."],
      oily: ["Peau grasse", "Grasse et brillante sur tout le visage."],
      combination: ["Peau mixte", "Chaque zone du visage réagit différemment."],
      sensitive: ["Peau sensible", "Rougit facilement et réagit aux irritations."],
      dehydrated_oily: ["Peau grasse déshydratée", "Grasse en surface mais sèche en profondeur."],
      acne_prone: ["Peau à tendance acnéique", "Boutons et imperfections fréquents."],
    },
    looks: looks({ natural: "Maquillage quotidien net et naturel", dewy: "Maquillage frais et lumineux", soft_matte: "Fini doux et velouté", soft_glam: "Élégant et sophistiqué", romantic: "Tons rose et pêche", bold_glam: "Maquillage intense et glamour" }),
    scalp: {
      oily_scalp: ["Cuir chevelu gras", "Produit beaucoup de sébum et graisse vite."],
      dry_scalp: ["Cuir chevelu sec", "Sec et tiraillé, avec des pellicules."],
      normal_scalp: ["Cuir chevelu normal", "Sébum et hydratation plutôt équilibrés."],
      sensitive_scalp: ["Cuir chevelu sensible", "Démange ou s'irrite facilement."],
      combination_scalp: ["Cuir chevelu mixte", "Gras à certains endroits, sec à d'autres."],
    },
  },
  pt: {
    ui: {
      title: "Encontre o seu match perfeito", ask: "O que você está procurando?",
      skin: "Skincare", skinSub: "Descubra seu tipo de pele", makeup: "Maquiagem", makeupSub: "Encontre seu look", hair: "Cabelo e couro cabeludo", hairSub: "Conheça seu couro cabeludo",
      skinIntro: "Vamos descobrir rapidinho o seu tipo de pele!", skinIntroSub: "Responda 5 perguntas rápidas.", start: "Começar", knowType: "Já sei meu tipo de pele",
      pickType: "Escolha seu tipo de pele", question: "Pergunta", of: "de", back: "Voltar", startOver: "Recomeçar", close: "Fechar", dontShowToday: "Não mostrar mais hoje",
      yourSkin: "Seu tipo de pele", yourLook: "Seu look", yourScalp: "Seu couro cabeludo", lookAsk: "Qual look de maquiagem você ama?", scalpAsk: "Como é seu couro cabeludo?",
      recommended: "Recomendado para você", routine: "Use nesta ordem", none: "Estamos preparando produtos para isso. Enquanto isso, veja todos os produtos.",
      viewAll: "Ver todos os produtos", view: "Ver", oilyArea: "Áreas oleosas", dryArea: "Áreas secas", sensitiveArea: "Áreas sensíveis", breakouts: "Espinhas", balanced: "Equilibrada",
      seeProducts: "Ver meus produtos",
    },
    questions: [
      ["Algumas horas depois de lavar o rosto, sem aplicar nada, como sua pele fica?", "Muito repuxada e descamando", "Repuxada e um pouco seca", "Confortável", "Brilhante no rosto todo", "Testa e nariz brilhantes, bochechas secas", "Oleosa por fora, mas repuxada por dentro"],
      ["No meio do dia, como está sua zona T (testa e nariz)?", "Seca ou descamando", "Matte", "Um pouco brilhante", "Muito oleosa"],
      ["E as bochechas?", "Ásperas ou descamando", "Repuxadas", "Confortáveis", "Brilhantes"],
      ["Com que frequência você tem espinhas?", "Raramente", "Às vezes", "Com frequência"],
      ["Como sua pele reage a produtos novos ou mudanças de clima?", "Quase não reage", "Às vezes fica vermelha", "Fica vermelha, coça ou arde com frequência"],
    ],
    skin: {
      extremely_dry: ["Pele extremamente seca", "Muito seca e descama com facilidade."],
      dry: ["Pele seca", "Falta oleosidade e hidratação, costuma repuxar."],
      normal: ["Pele normal", "Oleosidade e hidratação bem equilibradas."],
      oily: ["Pele oleosa", "Oleosa e brilhante no rosto todo."],
      combination: ["Pele mista", "Cada área do rosto se comporta de um jeito."],
      sensitive: ["Pele sensível", "Fica vermelha fácil e reage a irritações."],
      dehydrated_oily: ["Pele oleosa desidratada", "Oleosa na superfície, mas seca por dentro."],
      acne_prone: ["Pele com tendência à acne", "Espinhas e cravos aparecem com frequência."],
    },
    looks: looks({ natural: "Maquiagem do dia a dia limpa e natural", dewy: "Maquiagem viçosa e luminosa", soft_matte: "Acabamento suave e aveludado", soft_glam: "Sofisticada e marcante", romantic: "Tons rosados e pêssego", bold_glam: "Maquiagem intensa e glamourosa" }),
    scalp: {
      oily_scalp: ["Couro cabeludo oleoso", "Produz muito sebo e fica oleoso rápido."],
      dry_scalp: ["Couro cabeludo seco", "Seco e repuxado, com descamação."],
      normal_scalp: ["Couro cabeludo normal", "Oleosidade e hidratação bem equilibradas."],
      sensitive_scalp: ["Couro cabeludo sensível", "Coça ou irrita com facilidade."],
      combination_scalp: ["Couro cabeludo misto", "Oleoso em algumas áreas e seco em outras."],
    },
  },
  ja: {
    ui: {
      title: "あなたにぴったりを見つけよう", ask: "何をお探しですか？",
      skin: "スキンケア", skinSub: "肌タイプを診断", makeup: "メイク", makeupSub: "なりたいメイクを探す", hair: "ヘア・頭皮", hairSub: "頭皮タイプをチェック",
      skinIntro: "今からあなたの肌タイプをかんたん診断！", skinIntroSub: "5つの質問に答えてください。", start: "診断スタート", knowType: "肌タイプはわかっている",
      pickType: "肌タイプを選んでください", question: "質問", of: "/", back: "戻る", startOver: "最初から", close: "閉じる", dontShowToday: "今日はもう表示しない",
      yourSkin: "あなたの肌タイプ", yourLook: "あなたのメイク", yourScalp: "あなたの頭皮タイプ", lookAsk: "好きなメイクの雰囲気は？", scalpAsk: "頭皮の状態は？",
      recommended: "あなたへのおすすめ", routine: "この順番で使ってください", none: "ただいま商品を準備中です。全商品からお選びください。",
      viewAll: "すべての商品を見る", view: "見る", oilyArea: "皮脂が多い部分", dryArea: "乾燥しやすい部分", sensitiveArea: "敏感な部分", breakouts: "ニキビ", balanced: "バランス良好",
      seeProducts: "おすすめ商品を見る",
    },
    questions: [
      ["洗顔後、何もつけずに数時間たつと肌はどうなりますか？", "とてもつっぱって粉をふく", "つっぱって少し乾燥する", "快適", "顔全体がテカる", "おでこと鼻がテカり、頬は乾燥", "表面はベタつくのに内側はつっぱる"],
      ["お昼ごろ、Tゾーン（おでこと鼻）はどうなっていますか？", "乾燥して粉をふく", "さらっとしている", "少しテカる", "とてもテカる"],
      ["頬はどうですか？", "ガサガサ・粉をふく", "つっぱる", "快適", "テカる"],
      ["ニキビはどのくらいできますか？", "ほとんどできない", "ときどき", "よくできる"],
      ["新しい化粧品や季節の変わり目に、肌はどう反応しますか？", "ほとんど反応しない", "ときどき赤くなる", "よく赤み・かゆみ・ヒリつきが出る"],
    ],
    skin: {
      extremely_dry: ["超乾燥肌", "乾燥がひどく、角質が出やすい肌。"],
      dry: ["乾燥肌", "油分と水分が不足し、つっぱりやすい肌。"],
      normal: ["普通肌", "油分と水分のバランスが比較的安定した肌。"],
      oily: ["脂性肌", "顔全体に皮脂が多くテカりやすい肌。"],
      combination: ["混合肌", "部位によって肌の状態が異なる肌。"],
      sensitive: ["敏感肌", "赤くなりやすく、刺激に敏感な肌。"],
      dehydrated_oily: ["インナードライ肌", "皮脂は多いのに内側が乾燥している肌。"],
      acne_prone: ["ニキビができやすい肌", "ニキビや吹き出物がよくできる肌。"],
    },
    looks: looks({ natural: "自然で清潔感のあるデイリーメイク", dewy: "みずみずしいツヤ感メイク", soft_matte: "さらっとなめらかな肌表現", soft_glam: "洗練されたメリハリメイク", romantic: "ピンク・ピーチ系の愛らしいメイク", bold_glam: "強くて華やかなメイク" }),
    scalp: {
      oily_scalp: ["脂性頭皮", "皮脂が多く、ベタつきやすい。"],
      dry_scalp: ["乾燥頭皮", "乾燥してつっぱり、フケが出やすい。"],
      normal_scalp: ["普通頭皮", "油分と水分のバランスが比較的良い。"],
      sensitive_scalp: ["敏感頭皮", "かゆみや刺激を感じやすい。"],
      combination_scalp: ["混合頭皮", "部位によって皮脂と乾燥が異なる。"],
    },
  },
  ar: {
    ui: {
      title: "اعثري على ما يناسبك تمامًا", ask: "عمّ تبحثين؟",
      skin: "العناية بالبشرة", skinSub: "حددي نوع بشرتك", makeup: "المكياج", makeupSub: "اعثري على إطلالتك", hair: "الشعر وفروة الرأس", hairSub: "تعرفي على نوع فروة رأسك",
      skinIntro: "لنحدد نوع بشرتك بسرعة!", skinIntroSub: "أجيبي عن 5 أسئلة قصيرة.", start: "ابدئي", knowType: "أعرف نوع بشرتي",
      pickType: "اختاري نوع بشرتك", question: "السؤال", of: "من", back: "رجوع", startOver: "البدء من جديد", close: "إغلاق", dontShowToday: "عدم الإظهار اليوم",
      yourSkin: "نوع بشرتك", yourLook: "إطلالتك", yourScalp: "نوع فروة رأسك", lookAsk: "أي إطلالة مكياج تحبين؟", scalpAsk: "كيف هي فروة رأسك؟",
      recommended: "مقترح لك", routine: "استخدميها بهذا الترتيب", none: "نحضّر منتجات لذلك. يمكنك تصفح جميع المنتجات في الأثناء.",
      viewAll: "عرض جميع المنتجات", view: "عرض", oilyArea: "مناطق دهنية", dryArea: "مناطق جافة", sensitiveArea: "مناطق حساسة", breakouts: "حبوب", balanced: "متوازنة",
      seeProducts: "عرض منتجاتي",
    },
    questions: [
      ["بعد غسل وجهك بساعات ودون وضع أي شيء، كيف تشعرين ببشرتك؟", "مشدودة جدًا ومتقشرة", "مشدودة وجافة قليلًا", "مريحة", "لامعة في كل الوجه", "الجبهة والأنف لامعان والخدان جافان", "دهنية من الخارج ومشدودة من الداخل"],
      ["عند الظهيرة، كيف تبدو منطقة T (الجبهة والأنف)؟", "جافة أو متقشرة", "غير لامعة", "لامعة قليلًا", "دهنية جدًا"],
      ["وماذا عن الخدين؟", "خشنان أو متقشران", "مشدودان", "مريحان", "لامعان"],
      ["كم مرة تظهر لديك الحبوب؟", "نادرًا", "أحيانًا", "كثيرًا"],
      ["كيف تتفاعل بشرتك مع المنتجات الجديدة أو تغير الطقس؟", "نادرًا ما تتفاعل", "تحمرّ أحيانًا", "كثيرًا ما تحمرّ أو تحكّ أو تلسع"],
    ],
    skin: {
      extremely_dry: ["بشرة جافة جدًا", "جافة بشدة وتتقشر بسهولة."],
      dry: ["بشرة جافة", "ينقصها الزيت والترطيب وغالبًا ما تشد."],
      normal: ["بشرة عادية", "توازن جيد بين الزيت والترطيب."],
      oily: ["بشرة دهنية", "دهنية ولامعة في كل الوجه."],
      combination: ["بشرة مختلطة", "تختلف حالة البشرة من منطقة لأخرى."],
      sensitive: ["بشرة حساسة", "تحمرّ بسهولة وتتأثر بالمهيجات."],
      dehydrated_oily: ["بشرة دهنية تفتقر للماء", "دهنية من الخارج وجافة من الداخل."],
      acne_prone: ["بشرة معرضة لحب الشباب", "تظهر الحبوب والبثور كثيرًا."],
    },
    looks: looks({ natural: "مكياج يومي نظيف وطبيعي", dewy: "مكياج مرطب ومشرق", soft_matte: "لمسة ناعمة ومخملية", soft_glam: "أنيق وواضح الملامح", romantic: "درجات الوردي والخوخي", bold_glam: "مكياج قوي وجذاب" }),
    scalp: {
      oily_scalp: ["فروة رأس دهنية", "تفرز الكثير من الزيت وتتدهن بسرعة."],
      dry_scalp: ["فروة رأس جافة", "جافة ومشدودة مع قشرة."],
      normal_scalp: ["فروة رأس عادية", "توازن جيد بين الزيت والترطيب."],
      sensitive_scalp: ["فروة رأس حساسة", "تحكّ أو تتهيج بسهولة."],
      combination_scalp: ["فروة رأس مختلطة", "دهنية في مناطق وجافة في أخرى."],
    },
  },
};

export const consultTexts = (language: string) => CONSULT_TEXTS[language] || CONSULT_TEXTS.en;
export const questionZone = (i: number) => ZONES[i] || "full";
