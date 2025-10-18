import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-serif">Bloom & Grace</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              한국의 아름다움을 담은 프리미엄 화장품 브랜드. 
              자연에서 온 귀한 성분으로 당신의 우아함을 완성합니다.
            </p>
            <div className="flex gap-2 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all">
                <span className="sr-only">Instagram</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all">
                <span className="sr-only">Facebook</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all">
                <span className="sr-only">YouTube</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider">제품</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">전체 제품</Link></li>
              <li><Link to="/products?category=skincare" className="hover:text-primary transition-colors">스킨케어</Link></li>
              <li><Link to="/products?category=makeup" className="hover:text-primary transition-colors">메이크업</Link></li>
              <li><Link to="/products?category=new" className="hover:text-primary transition-colors">신제품</Link></li>
              <li><Link to="/products?category=bestseller" className="hover:text-primary transition-colors">베스트셀러</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider">브랜드</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/#about" className="hover:text-primary transition-colors">브랜드 스토리</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">매장 안내</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">지속가능성</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">성분 이야기</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">채용 정보</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider">고객지원</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-primary transition-colors">문의하기</Link></li>
              <li><Link to="/qa" className="hover:text-primary transition-colors">자주 묻는 질문</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">배송 안내</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">교환/반품</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">이용약관</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2024 Bloom & Grace. All rights reserved.</p>
            <p>고객센터: 1588-1234 | 이메일: contact@bloomandgrace.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
