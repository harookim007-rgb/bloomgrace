// Order confirmation email template. Edit copy/HTML here.
export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationData {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  pointsUsed?: number;
  total: number;
  bank?: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    business_name?: string;
  };
  paymentDeadline?: string; // ISO
}

const fmt = (n: number) => `₩${Math.round(n).toLocaleString("ko-KR")}`;

export function renderOrderConfirmationEmail(d: OrderConfirmationData) {
  const shortId = d.orderId.slice(0, 8).toUpperCase();
  const subject = `[BLOOM & GRACE] 주문 접수 완료 · #${shortId}`;

  const itemsRows = d.items.map(it => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; font-size:13px;">${escapeHtml(it.product_name)} <span style="color:#999;">× ${it.quantity}</span></td>
      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; font-size:13px; text-align:right;">${fmt(it.price * it.quantity)}</td>
    </tr>`).join("");

  const bankBlock = d.bank ? `
    <div style="margin-top:24px; padding:20px; background:#fafafa; border:1px solid #eee;">
      <h3 style="margin:0 0 12px; font-size:14px; letter-spacing:0.1em; text-transform:uppercase;">입금 계좌 안내</h3>
      <table style="width:100%; font-size:13px; line-height:1.9;">
        <tr><td style="color:#888; width:110px;">은행</td><td><strong>${escapeHtml(d.bank.bank_name)}</strong></td></tr>
        <tr><td style="color:#888;">계좌번호</td><td style="font-family:monospace; letter-spacing:0.05em;"><strong>${escapeHtml(d.bank.account_number)}</strong></td></tr>
        <tr><td style="color:#888;">예금주</td><td>${escapeHtml(d.bank.account_holder)}</td></tr>
        ${d.bank.business_name ? `<tr><td style="color:#888;">사업자</td><td>${escapeHtml(d.bank.business_name)}</td></tr>` : ""}
        <tr><td style="color:#888;">입금액</td><td style="color:#c0392b;"><strong>${fmt(d.total)}</strong></td></tr>
        ${d.paymentDeadline ? `<tr><td style="color:#888;">입금 기한</td><td>${new Date(d.paymentDeadline).toLocaleString("ko-KR")}</td></tr>` : ""}
      </table>
      <p style="margin:12px 0 0; font-size:12px; color:#888; line-height:1.6;">
        기한 내 미입금 시 주문이 자동 취소됩니다. 입금자명을 주문자 성함으로 정확히 기재해 주세요.
      </p>
    </div>` : "";

  const html = `
  <div style="font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; background: #ffffff;">
    <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #eee;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 300; font-size: 26px; margin: 0; letter-spacing: 0.05em;">BLOOM &amp; GRACE</h1>
    </div>

    <div style="padding: 28px 0 8px;">
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-weight:400; font-size:20px; margin:0 0 8px;">주문이 접수되었습니다</h2>
      <p style="font-size:13px; color:#666; margin:0;">${escapeHtml(d.customerName)}님, 주문해 주셔서 감사합니다.</p>
      <p style="font-size:12px; color:#999; margin:4px 0 0;">주문번호 · #${shortId}</p>
    </div>

    <table style="width:100%; margin-top:20px; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left; font-size:11px; color:#888; letter-spacing:0.1em; text-transform:uppercase; padding-bottom:8px; border-bottom:2px solid #1a1a1a;">상품</th>
          <th style="text-align:right; font-size:11px; color:#888; letter-spacing:0.1em; text-transform:uppercase; padding-bottom:8px; border-bottom:2px solid #1a1a1a;">금액</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <table style="width:100%; margin-top:16px; font-size:13px;">
      <tr><td style="padding:4px 0; color:#666;">상품 합계</td><td style="text-align:right;">${fmt(d.subtotal)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">배송비</td><td style="text-align:right;">${fmt(d.shippingFee)}</td></tr>
      ${d.pointsUsed ? `<tr><td style="padding:4px 0; color:#666;">포인트 사용</td><td style="text-align:right; color:#c0392b;">-${fmt(d.pointsUsed)}</td></tr>` : ""}
      <tr><td style="padding:10px 0 0; border-top:1px solid #eee; font-weight:700;">결제 금액</td><td style="padding:10px 0 0; border-top:1px solid #eee; text-align:right; font-weight:700; font-size:16px;">${fmt(d.total)}</td></tr>
    </table>

    ${bankBlock}

    <div style="border-top:1px solid #eee; padding-top:16px; margin-top:28px; font-size:11px; color:#999; text-align:center;">
      <p style="margin:0;">문의: welcometo@bloomgrace.shop</p>
      <p style="margin:8px 0 0;">© BLOOM &amp; GRACE. All rights reserved.</p>
    </div>
  </div>`;

  return { subject, html };
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
