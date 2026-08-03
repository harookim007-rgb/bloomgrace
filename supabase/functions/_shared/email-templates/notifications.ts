// Shared customer notification email templates (English, storefront default language).

export function escapeHtml(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function shell(inner: string) {
  return `
  <div style="font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; background: #ffffff;">
    <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #eee;">
      <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 26px; margin: 0; letter-spacing: 0.05em;">BLOOM &amp; GRACE</h1>
      <p style="color:#888; font-size:11px; letter-spacing:0.2em; margin-top:4px;">LUXURY K-BEAUTY</p>
    </div>
    <div style="padding: 28px 0;">${inner}</div>
    <div style="border-top:1px solid #eee; padding-top:16px; font-size:11px; color:#999; text-align:center;">
      <p style="margin:0;">Questions? offical@bloomgrace.shop</p>
      <p style="margin:8px 0 0;">© BLOOM &amp; GRACE. All rights reserved.</p>
    </div>
  </div>`;
}

const h2 = (t: string) =>
  `<h2 style="font-family: Georgia, serif; font-weight:400; font-size:21px; margin:0 0 14px;">${escapeHtml(t)}</h2>`;
const p = (t: string) =>
  `<p style="font-size:14px; line-height:1.7; color:#333; margin:0 0 12px;">${t}</p>`;
const box = (t: string) =>
  `<div style="margin:20px 0; padding:16px; background:#fafafa; border-left:3px solid #d4a5a5; font-size:13px; color:#555; line-height:1.7;">${t}</div>`;
const btn = (href: string, label: string) =>
  `<div style="text-align:center; margin:28px 0;"><a href="${href}" style="display:inline-block; background:#1a1a1a; color:#fff; padding:13px 30px; text-decoration:none; font-size:12px; letter-spacing:0.15em; text-transform:uppercase;">${escapeHtml(label)}</a></div>`;

const SHOP = "https://bloomgrace.shop";

export interface BankInfo {
  bank_name?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
  business_name?: string | null;
}

/** Reminder before the bank-transfer deadline expires. */
export function renderPaymentReminderEmail(d: {
  customerName: string; orderId: string; total: number; deadline?: string | null; bank?: BankInfo;
}) {
  const dl = d.deadline ? new Date(d.deadline).toUTCString() : null;
  return {
    subject: `Reminder: complete your payment · Order #${d.orderId.slice(0, 8).toUpperCase()}`,
    html: shell(
      h2(`Hi ${d.customerName}, your payment is still pending`) +
      p(`We are holding your order <strong>#${escapeHtml(d.orderId.slice(0, 8).toUpperCase())}</strong>. Please complete the bank transfer to confirm it.`) +
      box(
        `Amount due: <strong>${d.total.toLocaleString()} KRW</strong><br/>` +
        (dl ? `Payment deadline: <strong>${escapeHtml(dl)}</strong><br/>` : "") +
        (d.bank?.bank_name ? `Bank: ${escapeHtml(d.bank.bank_name)}<br/>` : "") +
        (d.bank?.account_number ? `Account: ${escapeHtml(d.bank.account_number)}<br/>` : "") +
        (d.bank?.account_holder ? `Holder: ${escapeHtml(d.bank.account_holder)}` : "")
      ) +
      p(`If the deadline passes, the order may be cancelled automatically.`) +
      btn(`${SHOP}/mypage`, "View my order")
    ),
  };
}

/** Payment received / order confirmed. */
export function renderPaymentConfirmedEmail(d: { customerName: string; orderId: string; total: number }) {
  return {
    subject: `Payment received · Order #${d.orderId.slice(0, 8).toUpperCase()}`,
    html: shell(
      h2(`Thank you, ${d.customerName} — payment confirmed`) +
      p(`We have received your payment of <strong>${d.total.toLocaleString()} KRW</strong> for order <strong>#${escapeHtml(d.orderId.slice(0, 8).toUpperCase())}</strong>.`) +
      p(`Your order is now being prepared. We will email you again as soon as it ships.`) +
      btn(`${SHOP}/mypage`, "Track my order")
    ),
  };
}

/** Shipping started. */
export function renderShippingStartedEmail(d: {
  customerName: string; orderId: string; carrier?: string | null; trackingNumber?: string | null; trackingUrl?: string | null;
}) {
  return {
    subject: `Your order is on the way · #${d.orderId.slice(0, 8).toUpperCase()}`,
    html: shell(
      h2(`${d.customerName}, your order has shipped`) +
      p(`Order <strong>#${escapeHtml(d.orderId.slice(0, 8).toUpperCase())}</strong> has left our warehouse.`) +
      (d.trackingNumber
        ? box(
            (d.carrier ? `Carrier: <strong>${escapeHtml(d.carrier)}</strong><br/>` : "") +
            `Tracking number: <strong>${escapeHtml(d.trackingNumber)}</strong>`
          )
        : "") +
      btn(d.trackingUrl || `${SHOP}/mypage`, d.trackingUrl ? "Track shipment" : "View my order")
    ),
  };
}

/** Delivered. */
export function renderDeliveredEmail(d: { customerName: string; orderId: string }) {
  return {
    subject: `Delivered · Order #${d.orderId.slice(0, 8).toUpperCase()}`,
    html: shell(
      h2(`${d.customerName}, your order has been delivered`) +
      p(`We hope you love your new K-Beauty routine.`) +
      p(`Leave a review from your order history and earn <strong>1,000P</strong> to use on your next order.`) +
      btn(`${SHOP}/mypage`, "Write a review")
    ),
  };
}

/** Reply to a customer support inquiry. */
export function renderInquiryReplyEmail(d: { customerName: string; question: string; reply: string }) {
  return {
    subject: `Re: your inquiry to Bloom & Grace`,
    html: shell(
      h2(`Hi ${d.customerName}, here is our reply`) +
      box(`<span style="color:#999;">Your message</span><br/>${escapeHtml(d.question).replace(/\n/g, "<br/>")}`) +
      p(escapeHtml(d.reply).replace(/\n/g, "<br/>")) +
      p(`If you need anything else, just reply to this email.`) +
      btn(SHOP, "Visit the shop")
    ),
  };
}

/** Internal alert to the shop owner when a new inquiry arrives. */
export function renderInquiryAdminEmail(d: { name: string; email: string; message: string; language?: string }) {
  return {
    subject: `[CS 문의] ${d.name} (${d.email})`,
    html: shell(
      h2(`새 고객 문의가 접수되었습니다`) +
      box(
        `이름: <strong>${escapeHtml(d.name)}</strong><br/>` +
        `이메일: <strong>${escapeHtml(d.email)}</strong><br/>` +
        `언어: ${escapeHtml(d.language || "en")}`
      ) +
      p(escapeHtml(d.message).replace(/\n/g, "<br/>")) +
      btn(`${SHOP}/admin?tab=inquiries`, "관리자에서 답변하기") +
      p(`<span style="font-size:12px;color:#888;">이 메일에 그대로 답장하면 고객(${escapeHtml(d.email)})에게 바로 전달됩니다.</span>`) +
      `<div style="text-align:center;margin-top:8px;"><a href="${SHOP}" style="font-size:12px;color:#888;">홈페이지 바로가기</a></div>`
    ),
  };
}
