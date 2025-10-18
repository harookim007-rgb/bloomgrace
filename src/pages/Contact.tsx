import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container max-w-6xl">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">
                문의하기
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">Contact Us</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              궁금하신 점이나 도움이 필요하신가요? 언제든 연락 주세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">메시지 보내기</h2>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">이름</label>
                    <Input 
                      placeholder="홍길동" 
                      className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">이메일</label>
                    <Input 
                      type="email" 
                      placeholder="your@email.com" 
                      className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">연락처</label>
                    <Input 
                      type="tel" 
                      placeholder="010-1234-5678" 
                      className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">문의 내용</label>
                    <Textarea 
                      placeholder="궁금하신 점을 자세히 적어주세요..." 
                      rows={6}
                      className="bg-background/50 border-border/50 focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-glow text-primary-foreground shadow-soft hover:shadow-elegant transition-all duration-500 py-6 text-base font-medium"
                  >
                    문의하기
                  </Button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">연락처 정보</h2>
              
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-soft hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">본사 주소</h3>
                      <p className="text-muted-foreground">
                        서울특별시 강남구 테헤란로 123<br />
                        블룸앤그레이스 빌딩 5층
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">전화번호</h3>
                      <p className="text-muted-foreground">
                        대표: 02-1234-5678<br />
                        고객센터: 1588-1234
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">이메일</h3>
                      <p className="text-muted-foreground">
                        일반 문의: contact@bloomandgrace.com<br />
                        제휴 문의: partnership@bloomandgrace.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">운영 시간</h3>
                      <p className="text-muted-foreground">
                        평일: 10:00 - 18:00<br />
                        점심시간: 12:00 - 13:00<br />
                        주말/공휴일 휴무
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-primary-soft/30 to-secondary-soft/30 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-3">방문 상담 예약</h3>
                  <p className="text-muted-foreground mb-4">
                    매장 방문 전 예약하시면 더욱 편리하게 상담받으실 수 있습니다.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-soft hover:shadow-elegant transition-all duration-500"
                  >
                    예약하기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-elegant">
            <div className="bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">오시는 길</p>
            </div>
            <div className="aspect-video bg-muted/50 flex items-center justify-center">
              <p className="text-muted-foreground">지도 영역 (실제 구현 시 Google Maps 또는 Kakao Map 연동)</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;
