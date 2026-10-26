// Preview must never fall back to the production WhatsApp sender or token.
export const isWhatsAppPreview = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";

export const WHATSAPP_TEST_PHONE_ID = "1082615518258503";

export function getWhatsAppSenderCredentials() {
  if (isWhatsAppPreview) {
    const phoneNumberId = process.env.WHATSAPP_TEST_PHONE_ID;
    const token = process.env.WHATSAPP_TEST_TOKEN;

    if (phoneNumberId !== WHATSAPP_TEST_PHONE_ID || !token) {
      throw new Error("Preview WhatsApp test credentials are missing or incorrect");
    }

    return { phoneNumberId, token };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error("WhatsApp credentials are missing");
  }
  return { phoneNumberId, token };
}

export function getWhatsAppVerifyToken() {
  return isWhatsAppPreview
    ? process.env.WHATSAPP_TEST_VERIFY_TOKEN
    : process.env.WHATSAPP_VERIFY_TOKEN;
}
