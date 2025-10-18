import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Package, RefreshCw, Shield, Sparkles, Leaf } from "lucide-react";

const faqs = [
  {
    category: "제품 관련",
    icon: Sparkles,
    questions: [
      {
        q: "제품은 어떤 성분으로 만들어지나요?",
        a: "저희 제품은 한국산 프리미엄 천연 성분으로 제조됩니다. 녹차 추출물, 장미 에센스, 유자 추출물, 진주 파우더 등 자연에서 온 귀한 성분들을 사용하며, 파라벤, 인공향료, 동물성 성분은 일절 사용하지 않습니다."
      },
      {
        q: "피부 타입에 맞는 제품을 어떻게 선택하나요?",
        a: "각 제품 페이지에 권장 피부 타입이 표시되어 있습니다. 민감성 피부를 위한 저자극 라인, 건성 피부를 위한 수분 집중 라인, 지성 피부를 위한 세범 케어 라인 등을 구분하여 제공합니다. 궁금하신 점은 언제든 문의해주세요."
      },
      {
        q: "동물 실험을 하나요?",
        a: "절대 하지 않습니다. Bloom & Grace는 동물 실험 반대를 원칙으로 하며, 모든 제품은 크루얼티 프리(Cruelty-Free) 인증을 받았습니다. 윤리적이고 지속 가능한 뷰티를 추구합니다."
      },
    ]
  },
  {
    category: "배송 및 주문",
    icon: Package,
    questions: [
      {
        q: "배송은 얼마나 걸리나요?",
        a: "국내 배송은 주문 후 2-3일 이내 도착하며, 해외 배송은 5-10일 정도 소요됩니다. 제주도 및 도서산간 지역은 1-2일 추가될 수 있습니다. 배송 추적번호는 발송 시 문자와 이메일로 안내드립니다."
      },
      {
        q: "배송비는 얼마인가요?",
        a: "국내 배송은 50,000원 이상 구매 시 무료이며, 50,000원 미만은 3,000원의 배송비가 부과됩니다. 해외 배송비는 국가별로 상이하며, 결제 시 자동 계산됩니다."
      },
      {
        q: "주문 취소나 변경이 가능한가요?",
        a: "배송 준비 중 단계까지는 고객센터를 통해 취소 및 변경이 가능합니다. 배송이 시작된 후에는 취소가 어려우며, 수령 후 교환/반품 절차를 이용해주셔야 합니다."
      },
    ]
  },
  {
    category: "교환 및 반품",
    icon: RefreshCw,
    questions: [
      {
        q: "교환/반품은 어떻게 하나요?",
        a: "제품 수령 후 7일 이내 미개봉 상태에서 교환 및 반품이 가능합니다. 고객센터로 연락 주시면 반품 주소와 절차를 안내드립니다. 단순 변심의 경우 왕복 배송비는 고객 부담입니다."
      },
      {
        q: "불량 제품을 받았어요.",
        a: "불량 제품에 대해서는 전액 환불 또는 교환해드립니다. 제품 사진과 함께 고객센터로 연락 주시면 신속하게 처리해드리며, 배송비는 저희가 부담합니다."
      },
    ]
  },
  {
    category: "회원 및 혜택",
    icon: Shield,
    questions: [
      {
        q: "회원 가입 혜택이 있나요?",
        a: "신규 회원 가입 시 10% 할인 쿠폰을 드리며, 구매 금액의 3%가 적립금으로 적립됩니다. 또한 생일 달에는 특별 쿠폰과 사은품을 제공합니다."
      },
      {
        q: "적립금은 어떻게 사용하나요?",
        a: "적립금은 1,000원 이상부터 사용 가능하며, 제품 구매 시 현금처럼 사용하실 수 있습니다. 적립금 유효기간은 적립일로부터 2년입니다."
      },
    ]
  },
  {
    category: "지속가능성",
    icon: Leaf,
    questions: [
      {
        q: "친환경 포장을 사용하나요?",
        a: "네, 모든 제품은 재활용 가능한 소재로 포장되며, 불필요한 플라스틱 사용을 최소화합니다. 포장재는 FSC 인증 종이와 생분해성 재료를 사용합니다."
      },
      {
        q: "리필 제품이 있나요?",
        a: "주요 스킨케어 라인은 리필 제품을 제공하고 있으며, 일반 제품 대비 20% 저렴한 가격으로 구매하실 수 있습니다. 빈 용기는 매장에 반납하시면 적립금을 드립니다."
      },
    ]
  },
  {
    category: "고객센터",
    icon: MessageCircle,
    questions: [
      {
        q: "고객센터 운영 시간은?",
        a: "평일 오전 10시부터 오후 6시까지 운영하며, 점심시간은 오후 12시~1시입니다. 주말 및 공휴일은 휴무이며, 이메일 문의는 24시간 접수 가능합니다."
      },
      {
        q: "1:1 상담이 가능한가요?",
        a: "네, 웹사이트의 채팅 상담 또는 이메일(contact@bloomandgrace.com)로 1:1 맞춤 상담을 받으실 수 있습니다. 피부 고민, 제품 추천 등 무엇이든 문의해주세요."
      },
    ]
  },
];

const QA = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background via-primary-soft/10 to-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">
                자주 묻는 질문
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">Q&A</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              고객님들께서 가장 많이 물어보시는 질문들을 모았습니다. 
              궁금하신 점이 있으시다면 언제든 문의해주세요.
            </p>
          </div>

          <div className="space-y-12">
            {faqs.map((category, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{category.category}</h2>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem 
                      key={qIdx} 
                      value={`item-${idx}-${qIdx}`}
                      className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:shadow-soft transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left hover:text-primary transition-colors py-5 text-base md:text-lg font-medium">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm md:text-base">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center p-10 rounded-2xl bg-gradient-to-br from-primary-soft/30 to-secondary-soft/30 border border-border/50">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">답변을 찾지 못하셨나요?</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              고객센터로 문의해주시면 친절하게 답변드리겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:contact@bloomandgrace.com"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-500"
              >
                이메일 문의하기
              </a>
              <a 
                href="tel:+82-2-1234-5678"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-secondary/40 hover:border-secondary hover:bg-secondary/10 backdrop-blur-sm transition-all duration-500 font-medium"
              >
                전화 상담하기
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default QA;
