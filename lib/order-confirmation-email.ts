type ConfirmationEmailInput = {
  name: string;
  reportType: string;
  amount: number;
  orderId: string;
  paymentId: string;
  language?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function buildOrderConfirmationEmail(order: ConfirmationEmailInput) {
  const name = escapeHtml(order.name || "Customer");
  const reportType = escapeHtml(order.reportType);
  const orderId = escapeHtml(order.orderId);
  const paymentId = escapeHtml(order.paymentId);
  const amount = `₹${order.amount.toLocaleString("en-IN")}`;
  const isHindi = order.language?.trim().toLowerCase() === "hindi";

  const subject = isHindi
    ? `भुगतान की पुष्टि: ${order.reportType}`
    : `Payment confirmed: ${order.reportType}`;

  const heading = isHindi ? "आपका भुगतान सफल रहा" : "Your payment is confirmed";
  const greeting = isHindi ? `राधे राधे ${name} जी,` : `Radhe Radhe ${name},`;
  const intro = isHindi
    ? `आपका <strong>${reportType}</strong> ऑर्डर पुष्टि हो गया है।`
    : `Your order for <strong>${reportType}</strong> is confirmed.`;
  const nextHeading = isHindi ? "अब आगे क्या होगा" : "What happens next";
  const nextCopy = isHindi
    ? "हमारी टीम आपकी जानकारी देखकर रिपोर्ट तैयार करेगी। रिपोर्ट तैयार होने पर हम इसे WhatsApp पर भेजेंगे। यदि आपने ईमेल दिया है, तो वहाँ भी साझा करेंगे।"
    : "Our team will review your details and prepare your report. When it’s ready, we’ll send it to you on WhatsApp. If you provided an email address, we’ll share it there too.";
  const supportCopy = isHindi
    ? "WhatsApp या ईमेल पर संदेश न मिले, तब भी आपका ऑर्डर सुरक्षित है। मदद के लिए नीचे दिए गए संदर्भ नंबर के साथ हमसे संपर्क करें।"
    : "If you don’t receive a WhatsApp message, your order is still recorded. Contact us with the order reference below and we’ll help.";

  return {
    subject,
    html: `
      <div style="margin:0;padding:28px 12px;background:#fcf7ee;font-family:Arial,Helvetica,sans-serif;color:#2a1400;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8d8b8;border-radius:16px;overflow:hidden;">
          <div style="padding:22px 24px;background:#8b1e1e;color:#ffffff;">
            <p style="margin:0 0 8px;color:#f5d98a;font-size:12px;font-weight:bold;letter-spacing:1.5px;">SURABHI ASTROLOGY</p>
            <h1 style="margin:0;font-size:24px;line-height:1.3;">${heading}</h1>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 10px;font-size:16px;">${greeting}</p>
            <p style="margin:0 0 22px;color:#5b4636;line-height:1.6;">${intro}</p>
            <div style="padding:16px;background:#fcf7ee;border:1px solid #e8d8b8;border-radius:12px;">
              <p style="margin:0 0 12px;font-size:12px;font-weight:bold;letter-spacing:1px;color:#8b1e1e;">${isHindi ? "भुगतान रसीद" : "PAYMENT RECEIPT"}</p>
              <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 0;color:#6b5b4d;">${isHindi ? "रिपोर्ट" : "Report"}</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${reportType}</td></tr>
                <tr><td style="padding:6px 0;color:#6b5b4d;">${isHindi ? "भुगतान" : "Amount paid"}</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${amount}</td></tr>
                <tr><td style="padding:6px 0;color:#6b5b4d;">${isHindi ? "ऑर्डर संदर्भ" : "Order reference"}</td><td style="padding:6px 0;text-align:right;font-size:12px;word-break:break-all;">${orderId}</td></tr>
                <tr><td style="padding:6px 0;color:#6b5b4d;">${isHindi ? "भुगतान संदर्भ" : "Payment reference"}</td><td style="padding:6px 0;text-align:right;font-size:12px;word-break:break-all;">${paymentId}</td></tr>
              </table>
            </div>
            <h2 style="margin:24px 0 8px;font-size:17px;color:#8b1e1e;">${nextHeading}</h2>
            <p style="margin:0 0 16px;color:#5b4636;line-height:1.6;">${nextCopy}</p>
            <p style="margin:0;color:#5b4636;line-height:1.6;font-size:13px;">${supportCopy}</p>
            <div style="margin-top:22px;padding-top:16px;border-top:1px solid #eee4d4;font-size:13px;line-height:1.8;">
              <a href="https://wa.me/919251151330" style="color:#1b4d30;font-weight:bold;">${isHindi ? "WhatsApp पर सहायता लें" : "Get help on WhatsApp"}</a>
              <span style="color:#9a8876;"> &nbsp;·&nbsp; </span>
              <a href="mailto:info@surabhiastrology.com" style="color:#8b1e1e;font-weight:bold;">${isHindi ? "हमें ईमेल करें" : "Email our team"}</a>
            </div>
          </div>
        </div>
      </div>
    `,
  };
}
