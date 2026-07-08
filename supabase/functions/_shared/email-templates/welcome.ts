// Welcome email template. Edit copy/HTML here — no code changes required elsewhere.
export interface WelcomeEmailData {
  name: string;
  shopUrl?: string;
}

export function renderWelcomeEmail(data: WelcomeEmailData) {
  const name = data.name || "고객";
  const shopUrl = data.shopUrl || "https://bloomgrace.shop";

  const subject = `${name}님, BLOOM & GRACE에 오신 것을 환영합니다 🌸`;

  const html = `
  <div style="font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; background: #ffffff;">
    <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #eee;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 300; font-size: 28px; margin: 0; letter-spacing: 0.05em;">BLOOM &amp; GRACE</h1>
      <p style="color:#888; font-size:12px; letter-spacing:0.2em; margin-top:4px;">LUXURY K-BEAUTY</p>
    </div>

    <div style="padding: 32px 0;">
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 400; font-size: 22px; margin: 0 0 16px;">
        ${escapeHtml(name)}님, 반갑습니다.
      </h2>
      <p style="font-size:14px; line-height:1.7; color:#333;">
        BLOOM &amp; GRACE 회원이 되신 것을 진심으로 환영합니다.<br/>
        엄선된 K-Beauty 제품과 개인 맞춤 뷰티 큐레이션을 만나보세요.
      </p>

      <div style="margin: 24px 0; padding: 16px; background:#fafafa; border-left: 3px solid #d4a5a5;">
        <p style="margin:0; font-size:13px; color:#555; line-height:1.6;">
          ✿ 신규 회원 <strong>1,000P</strong> 적립<br/>
          ✿ AI 뷰티 컨설테이션 무료 이용<br/>
          ✿ 회원 전용 프로모션 우선 안내
        </p>
      </div>

      <div style="text-align:center; margin: 32px 0;">
        <a href="${shopUrl}" style="display:inline-block; background:#1a1a1a; color:#fff; padding: 14px 32px; text-decoration:none; font-size:13px; letter-spacing:0.15em; text-transform:uppercase;">
          쇼핑 시작하기
        </a>
      </div>
    </div>

    <div style="border-top:1px solid #eee; padding-top:16px; font-size:11px; color:#999; text-align:center;">
      <p style="margin:0;">문의: welcometo@bloomgrace.shop</p>
      <p style="margin:8px 0 0;">© BLOOM &amp; GRACE. All rights reserved.</p>
    </div>
  </div>`;

  return { subject, html };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
