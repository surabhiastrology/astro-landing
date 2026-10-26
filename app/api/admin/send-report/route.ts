import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { getWhatsAppSenderCredentials } from "@/lib/whatsappEnvironment";

// Initialize the Order model (handling strict mode for dynamic fields)
const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({}, { strict: false }));

export async function POST(req: Request) {
  try {
    // 1. Added 'orderId' to the destructured body
    const { phone, pdfUrl, fileName, userName, orderId } = await req.json();
    
    const { phoneNumberId, token } = getWhatsAppSenderCredentials();
    
    if (!phoneNumberId || !token) {
      throw new Error("Missing WhatsApp Credentials in Environment Variables");
    }

    const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      throw new Error("Invalid phone number format");
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: "report_delivery",
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: pdfUrl,
                  filename: fileName || "Astrology_Report.pdf"
                }
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: userName || "Customer"
              }
            ]
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("META API ERROR:", JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || "Meta API Error");
    }

    // ==========================================
    // NEW: Update Database for Report Status
    // ==========================================
    await connectDB();
    if (orderId) {
      await Order.findOneAndUpdate(
        { orderId: orderId },
        { $set: { reportSent: true } }
      );
    }

    console.log(`✅ Report status updated in DB for ${orderId}`);
    return NextResponse.json({ success: true, messageId: data.messages?.[0]?.id });

  } catch (error: any) {
    console.error("SEND-REPORT CRITICAL ERROR:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
