// app/api/webhook/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";

// ==========================================
// 1. INITIALIZE SERVICES (With Caching)
// ==========================================
const resend = new Resend(process.env.RESEND_API_KEY);

let redis: Redis;
const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
  }
  return redis;
};

// Serverless MongoDB Connection Cache
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, 
      maxPoolSize: 10 
    }).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ==========================================
// 2. SCHEMAS
// ==========================================
const OrderSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  reportType: { type: String },
  customer: {
    name: String, email: String, phone: String,
    dob: String, tob: String, city: String,
    pinCode: String, gender: String, language: String, challenge: String,
  },
  partner: {
    name: String, dob: String, tob: String, city: String, gender: String
  },
  challenge: { type: String },
  status: { type: String, default: "Paid" },
  reportSent: { type: Boolean, default: false }, 
  answerSent: { type: Boolean, default: false },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

// NEW: Chat Schema to log payment confirmation messages to the CRM
const ChatSchema = new mongoose.Schema({
  phoneNumber: String,
  waName: String,
  message: String,
  step: String,
  type: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);


// ==========================================
// 3. WHATSAPP SENDER (UPDATED FOR TEMPLATES)
// ==========================================
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[], templateData?: any) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`; 

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  // 1. Template Logic (Bypasses 24h limit)
  if (templateData) {
    payload.type = "template";
    payload.template = {
      name: templateData.name,
      language: { code: templateData.language },
      components: [
        {
          type: "body",
          parameters: templateData.params.map((param: string) => ({
            type: "text",
            text: param
          }))
        }
      ]
    };
  } 
  // 2. Original Interactive Logic
  else if (buttons?.length) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text: text },
      action: {
        buttons: buttons.slice(0, 3).map((btnTitle, index) => ({
          type: "reply",
          reply: { id: `btn_${index}`, title: btnTitle.substring(0, 20) } 
        }))
      }
    };
  } 
  // 3. Original Text Logic
  else {
    payload.type = "text";
    payload.text = { body: text };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error(`WA API Error: ${JSON.stringify(err)}`);
  }
}

// ==========================================
// 4. MAIN POST HANDLER
// ==========================================
export async function POST(req: Request) {
  try {
    const rawBody = await req.text(); 
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const { id: paymentId, order_id: razorpayOrderId, notes, amount: amountPaise } = event.payload.payment.entity;

      await connectDB();
      
      const order = await Order.findOne({ orderId: razorpayOrderId });
      
      if (order && order.status === "Paid") {
        return NextResponse.json({ status: "already_processed" }, { status: 200 }); 
      }

      // 1. EXTRACT DATA FROM NOTES
      const formData = notes?.formData ? JSON.parse(notes.formData) : {};

      if (!order) {
        // Fallback: Create Order if success API hasn't run yet
        await Order.create({
          paymentId,
          orderId: razorpayOrderId,
          amount: amountPaise / 100,
          reportType: formData.reportType || "Vedic Report",
          customer: formData,
          partner: {
            name: formData?.partnerName,
            dob: formData?.partnerDob,
            tob: formData?.partnerTob,
            city: formData?.partnerCity,
            gender: formData?.partnerGender
          },
          challenge: formData.challenge || "No specific challenge provided",
          status: "Paid",
          createdAt: new Date()
        });
      } else {
        // Update existing pending order
        await Order.updateOne(
          { _id: order._id },
          { $set: { status: "Paid", paymentId: paymentId, challenge: formData.challenge } }
        );
      }

      // 2. TRIGGER NOTIFICATIONS
      const finalOrder = await Order.findOne({ orderId: razorpayOrderId }).lean();
      await triggerNotifications(finalOrder, paymentId);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error: any) {
    console.error("Critical Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}

// ==========================================
// 5. NOTIFICATIONS
// ==========================================
async function triggerNotifications(order: any, paymentId: string) {
  const adminEmails = ["developer.thinqit@gmail.com", "surabhiastrology9@gmail.com"]; 
  const senderEmail = process.env.EMAIL_FROM || "Surabhi Astrology <info@surabhiastrology.com>";
  
  let formattedPhone = order.customer.phone.replace(/\D/g, "");
  if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

  const reportType = order.reportType || "Service";
  const isHi = order.customer.language === "hindi";
  const isCareer = reportType.toLowerCase().includes("career") || reportType.toLowerCase().includes("करियर");
  const isMatchmaking = reportType.toLowerCase().includes("couple match making");

  let replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${order.customer.name || "ji"}!*\nYour order for the *${reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳`;
  let waButtons: string[] | undefined = undefined;

  if (isCareer) {
    replyMessage += `\n\n🎁 *Bonus:* As promised, please click below to choose your 1 FREE career question!`;
    waButtons = isHi ? ["प्रश्न पूछें"] : ["Ask Question"];
  }

  // Prepare Template Data for Webhook
  let templateName = "";
  if (isCareer) {
    templateName = isHi ? "payment_career_hi" : "payment_career_en";
  } else {
    templateName = isHi ? "payment_general_hi" : "payment_general_en";
  }

  const waTemplateData = {
    name: templateName,
    language: isHi ? "hi" : "en",
    params: [order.customer.name || "Customer", reportType]
  };

  const nextStep = isCareer ? "F1_START" : "F1_END";

  await Promise.allSettled([
    // Customer Email
    resend.emails.send({
      from: senderEmail,
      to: order.customer.email,
      subject: `Order Confirmed: ${order.reportType} ✨`,
      html: `<h2>Radhe Radhe ${order.customer.name} ji,</h2><p>Your payment for <strong>${order.reportType}</strong> is confirmed. Check WhatsApp for updates!</p>`,
    }),

    // Admin Email — keep the established paid-order format consistent with
    // the checkout confirmation route. The webhook is the authoritative
    // payment-confirmation path, so it must not produce a competing design.
    resend.emails.send({
      from: senderEmail,
      to: adminEmails,
      subject: `🚨 NEW PAID ORDER: ${order.customer.name} [₹${order.amount}] | ${order.customer.language}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #8B1E1E; padding: 25px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Premium Order! 🚀</h1>
            <p style="color: #F5D98A; margin: 5px 0 0 0; font-weight: bold; letter-spacing: 1px;">SURABHI ASTROLOGY</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
              <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">🛒 Transaction Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #666;">Report Type:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.reportType}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Language:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.customer.language}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Amount Paid:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #1B4D30;">₹${order.amount}</td></tr>
              </table>
            </div>

            <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
              <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">👤 Person 1 Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #666;">Name:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.customer.name}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Birth Info:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.customer.dob} | ${order.customer.tob}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Location:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.customer.city} (${order.customer.pinCode})</td></tr>
              </table>
            </div>

            ${isMatchmaking && order.partner ? `
            <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
              <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">💑 Person 2 Details (Partner)</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #666;">Name:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.partner.name}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Birth Info:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.partner.dob} | ${order.partner.tob}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Location:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${order.partner.city}</td></tr>
              </table>
            </div>
            ` : ''}

            <div style="margin-bottom: 10px;">
              <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">🎯 Current Challenge / Question</h3>
              <p style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; color: #333; line-height: 1.5; font-style: italic;">
                "${order.challenge || "No specific challenge provided."}"
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://wa.me/${formattedPhone}" style="background-color: #1B4D30; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Open User WhatsApp</a>
            </div>
          </div>
        </div>
      `,
    }),

    // WhatsApp Message
    sendWhatsAppMessage(formattedPhone, replyMessage, waButtons, waTemplateData),

    // NEW: Log the Payment Confirmation Message to the CRM (MongoDB)
    (async () => {
      await connectDB();
      await Chat.create({
        phoneNumber: formattedPhone,
        waName: "Bot",
        message: replyMessage,
        step: nextStep,
        type: "bot_flow_response", // Renders as an automated bot reply in the UI
        timestamp: new Date()
      });
    })(),

    // Update state in Redis
    getRedis().set(
      `user_state:${formattedPhone}`, 
      JSON.stringify({ 
        step: nextStep, 
        userData: { name: order.customer.name, intent: reportType, language: isHi ? "hi" : "en", challenge: order.challenge } 
      }), 
      "EX", 86400
    )
  ]);
}
