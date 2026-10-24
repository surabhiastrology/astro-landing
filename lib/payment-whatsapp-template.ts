type PaymentTemplateInput = {
  customerName?: string;
  reportType: string;
  language?: string;
  urgentDelivery: boolean;
};

// The priority templates must be approved in WhatsApp Manager before this
// selection is deployed. Existing templates contain a fixed 72-hour promise.
export function getPaymentWhatsAppTemplate({
  customerName,
  reportType,
  language,
  urgentDelivery,
}: PaymentTemplateInput) {
  const isHindi = language === "hindi";
  const isCareer = /career|करियर/i.test(reportType);

  const name = urgentDelivery
    ? isHindi ? "payment_priority_hi" : "payment_priority_en"
    : isCareer
      ? isHindi ? "payment_career_hi" : "payment_career_en"
      : isHindi ? "payment_general_hi" : "payment_general_en";

  return {
    name,
    language: isHindi ? "hi" : "en",
    params: [
      customerName || "Customer",
      urgentDelivery
        ? `${reportType} (${isHindi ? "24 घंटे में प्राथमिकता डिलीवरी" : "24-hour priority delivery"})`
        : reportType,
    ],
  };
}
