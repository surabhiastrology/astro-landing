// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nextMessage } from "@/lib/waFlow";
import Redis from "ioredis";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import crypto from "node:crypto";
import { CheckoutRecovery, recoveryEnvironment, saveWhatsAppOptOut } from "@/lib/checkout-recovery";
import {
  getWhatsAppSenderCredentials,
  getWhatsAppVerifyToken,
  isWhatsAppPreview,
  WHATSAPP_TEST_PHONE_ID,
} from "@/lib/whatsappEnvironment";

// ==========================================
// 1. SINGLETON / GLOBAL SETUP
// ==========================================
const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 1 
});

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
  });
  isConnected = !!db.connections[0].readyState;
}

const ChatSchema = new mongoose.Schema({
  phoneNumber: String,
  waName: String,
  message: String,
  step: String,
  type: String,
  timestamp: { type: Date, default: Date.now }
});

const chatModelName = isWhatsAppPreview ? "WhatsAppPreviewChat" : "Chat";
const Chat = mongoose.models[chatModelName] || mongoose.model(
  chatModelName,
  ChatSchema,
  isWhatsAppPreview ? "whatsapp_preview_chats" : undefined
);
const stateKey = (phone: string) => `${isWhatsAppPreview ? "wa_preview:" : ""}user_state:${phone}`;
const processedKey = (id: string) => `${isWhatsAppPreview ? "wa_preview:" : ""}msg_processed:${id}`;
const interactionKey = isWhatsAppPreview ? "wa_preview:last_interaction" : "wa_last_interaction";
const namesKey = isWhatsAppPreview ? "wa_preview:names" : "wa_names";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// 2. WHATSAPP SENDER HELPER (FIXED TO RETURN STATUS)
// ==========================================
export async function sendWhatsAppMessage(
  to: string, 
  text: string, 
  options?: { buttons?: string[], list?: any, image?: string, urlButton?: { text: string; url: string } }
): Promise<boolean> {
  const { phoneNumberId, token } = getWhatsAppSenderCredentials();
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchOptions = {
    method: "POST",
    headers: commonHeaders,
    keepalive: true, 
  };

  // A URL CTA cannot carry the image header used by reply buttons. Send its
  // image separately, then send the payment CTA as a valid standalone message.
  const needsPreSend = Boolean(options?.image && (options?.list || options?.urlButton));

  if (needsPreSend) {
    try {
      const imgRes = await fetch(url, {
        ...fetchOptions,
        body: JSON.stringify({ messaging_product: "whatsapp", to, type: "image", image: { link: options!.image! } }),
      });
      if (!imgRes.ok) console.error("Img Error:", await imgRes.json());
    } catch (e) { console.error("Img Fetch Error:", e); }
  }

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  if (options?.urlButton) {
    payload.type = "interactive";
    payload.interactive = {
      type: "cta_url",
      body: { text: text },
      action: {
        name: "cta_url",
        parameters: { display_text: options.urlButton.text, url: options.urlButton.url }
      }
    };
  } else if (options?.list) {
    // SAFEGUARD: Auto-truncate row titles to 24 characters right before sending to prevent API 131009 Crashes
    const sanitizedSections = options.list.sections?.map((section: any) => ({
      ...section,
      rows: section.rows?.map((row: any) => ({
        ...row,
        title: row.title.substring(0, 24)
      }))
    }));

    payload.type = "interactive";
    payload.interactive = { 
      type: "list", 
      body: { text: text }, 
      action: { ...options.list, sections: sanitizedSections } 
    };
  } else if (options?.buttons && options.buttons.length > 0) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text: text },
      action: {
        buttons: options.buttons.slice(0, 3).map((btnTitle, index) => ({
          type: "reply",
          reply: { id: `btn_${index}`, title: btnTitle.substring(0, 20) }
        }))
      }
    };
    if (options.image) payload.interactive.header = { type: "image", image: { link: options.image } };
  } else if (options?.image) {
    payload.type = "image";
    payload.image = { link: options.image, caption: text };
  } else {
    payload.type = "text";
    payload.text = { body: text };
  }

  try {
    const response = await fetch(url, { ...fetchOptions, body: JSON.stringify(payload) });
    if (!response.ok) {
      console.error("Meta API Error:", await response.json());
      return false; // Return false so background tasks aren't processed
    }
    return true; // Successfully delivered
  } catch (error) { 
    console.error("Failed to send WA message:", error); 
    return false;
  }
}

// ==========================================
// 3. SYSTEM INSTRUCTION & MODELS FOR GEMINI
// ==========================================
const MODELS = [
  'gemini-1.5-flash', 
  'gemini-2.5-flash',                    
  'gemini-2.0-flash',        
  'gemini-1.5-flash-8b'     
];

const GEMINI_SYSTEM_PROMPT =  `
Surbhi Gupta WhatsApp AI Assistant

You are the official WhatsApp assistant for Celebrity Astrologer Surbhi Gupta.

Your job is to chat like a real human assistant, not an AI or customer support bot. Your goal is to understand the user’s concern, build trust, and naturally recommend the most suitable service.

Communication Style

* Always begin with “Radhe Radhe 🙏”.
* Match the user’s language (English, Hindi, or Hinglish).
* If they speak in Hindi (Devanagari script), reply in SIMPLE, EVERYDAY SPOKEN HINDI (Bol-chal ki bhasha). DO NOT use formal, pure, or difficult Hindi words (Shuddh Hindi). Use very common, casual words that everyone understands.
* Keep replies warm, natural, and conversational.
* Use simple everyday language.
* Keep replies under 4 short sentences.
* Never write long paragraphs or sound salesy.

Conversation Flow

1. Acknowledge the user’s concern.
2. Show empathy before recommending any service.
3. Ask one simple follow-up question if needed.
4. Recommend the most suitable service.
5. End by guiding them to the service menu list or ask them to choose from services menu list 📋.


Available Services for your reference:
- Surbhi Consultation: Offline (₹24,000), Priority (₹51,000)
- Numerology Report: Basic (₹1,100), Correction (₹5,100), With Call (₹11,000)
- Couple Match Making: Basic (₹1,100), Match+1Q (₹3,300), Match+Call (₹11,000)
- Baby Name Report: Report (₹1,100), Report+Name (₹5,100)
- Career/Love/Health Problem: PDF Report (₹999), 1-on-1 Call (₹11,000)
- Surbhi Kundli: 10-Yr Report (₹999) & Life Report + 1Q (₹2,999)

Service Recommendations

* Premium Surbhi Kundli (₹999) – Your primary recommendation. It includes a detailed 10-Year Prediction Report and, for a limited time, Surbhi Ji personally answers one important question.
* 1-on-1 face Consultation (in this dont suggest offline thing)
* Recommend Numerology, Premium kundali report, Match Making, Baby Name, or other reports only when they match the user’s concern.

Important Rules

* Never say you’re an AI or chatbot.
* Never provide free predictions or guaranteed results.
* Never create fear or pressure users to buy.
* Sound like Surbhi Ji’s real assistant on WhatsApp—kind, reassuring, and helpful.
`;
// ==========================================
// 4. HANDLERS
// ==========================================
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const verifyToken = getWhatsAppVerifyToken();
  if (verifyToken && search.get("hub.mode") === "subscribe" && search.get("hub.verify_token") === verifyToken) {
    return new NextResponse(search.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  let body;
  // Once the live app secret is installed, continue processing signed STOP and
  // delivery callbacks even if new recovery sends are later disabled.
  const recoveryWebhookEnabled = isWhatsAppPreview ||
    (process.env.VERCEL_ENV === "production" && Boolean(process.env.WHATSAPP_APP_SECRET));
  if (recoveryWebhookEnabled) {
    if (isWhatsAppPreview) {
      try {
        getWhatsAppSenderCredentials();
      } catch {
        return new NextResponse("Preview WhatsApp is not configured", { status: 503 });
      }
    }
    const appSecret = isWhatsAppPreview
      ? process.env.WHATSAPP_TEST_APP_SECRET
      : process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
      return new NextResponse("Webhook signing is not configured", { status: 503 });
    }
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256") || "";
    const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return new NextResponse("Invalid webhook signature", { status: 403 });
    }
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new NextResponse("Invalid webhook body", { status: 400 });
    }
  } else {
    body = await req.json();
  }
  try {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    // A preview deployment must never process a live-number webhook, even if
    // Meta's app-wide callback is configured incorrectly.
    if ((isWhatsAppPreview && value?.metadata?.phone_number_id !== WHATSAPP_TEST_PHONE_ID) ||
        (recoveryWebhookEnabled && !isWhatsAppPreview && value?.metadata?.phone_number_id !== process.env.WHATSAPP_PHONE_ID)) {
      return new NextResponse("Ignored", { status: 200 });
    }
    if (recoveryWebhookEnabled && Array.isArray(value?.statuses)) {
      await connectDB();
      for (const status of value.statuses) {
        if (typeof status?.id === "string" && typeof status?.status === "string") {
          const deliveryError = status.status === "failed" && Number.isInteger(status?.errors?.[0]?.code)
            ? { errorCode: `meta_delivery_code_${status.errors[0].code}` } : {};
          await CheckoutRecovery.updateOne(
            { whatsappMessageId: status.id, environment: recoveryEnvironment() },
            { $set: { messageStatus: status.status, ...deliveryError } },
          );
        }
      }
    }
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];
    
    if (!message) return new NextResponse("OK", { status: 200 });

    const from = message.from;
    const messageId = message.id;
    const waName = contact?.profile?.name || "Seeker";

    const isDuplicate = await redis.get(processedKey(messageId));
    if (isDuplicate) return new NextResponse("OK", { status: 200 });
    
    redis.set(processedKey(messageId), "1", "EX", 3600);

    let incomingText = "";
    let flowInput = "";
    let msgType = "text";

    if (message.type === "interactive") {
      const listReply = message.interactive?.list_reply;
      const buttonReply = message.interactive?.button_reply;
      incomingText = listReply?.title || buttonReply?.title || "";
      // List IDs are stable identifiers; titles are truncated for WhatsApp's
      // display limit and must not be used to choose the payable plan.
      flowInput = listReply?.id || incomingText;
      msgType = listReply ? "list_selection" : "button_click";
    } else {
      incomingText = message.text?.body || "";
      flowInput = incomingText;
    }

    // STOP changes persistent opt-out state only after webhook signature verification.
    if (recoveryWebhookEnabled && /^(stop|unsubscribe|opt\s*out)$/i.test(incomingText.trim())) {
      await saveWhatsAppOptOut(from);
      await redis.hdel(interactionKey, from);
      return new NextResponse("OK", { status: 200 });
    }

    const rawPrevState = await redis.get(stateKey(from));
    const prev = rawPrevState ? JSON.parse(rawPrevState) : { step: "START", userData: { name: waName } };
    
    let lowerInput = incomingText.toLowerCase();

    if (lowerInput.includes("main menu")) {
      incomingText = "restart";
      flowInput = "restart";
      lowerInput = "restart";
    }
    
    if (prev.step === "PAUSED_BY_ADMIN" && !["restart", "hi", "hello"].includes(lowerInput)) {
       await connectDB();
       await Chat.create({ phoneNumber: from, waName, message: incomingText, step: "PAUSED_BY_ADMIN", type: msgType, timestamp: new Date() });
       return new NextResponse("OK", { status: 200 }); 
    }

    const isStandardCommand = ["restart", "hi", "hello", "hi surbhi", "paid"].includes(lowerInput);
    const isInteractive = msgType === "list_selection" || msgType === "button_click";
    
    const isExpectingFreeQuestion = prev.step === "F1_START" || prev.step === "F1_FREE_QUESTION";
    const isShortIntentKeyword = (prev.step === "F2_HOOK" || prev.step === "F2_SOLUTION") && incomingText.trim().length <= 25;

    let finalReply = "";
    let finalButtons: string[] | undefined = undefined;
    let finalList: any = undefined;
    let finalImage: string | undefined = undefined;
    let finalUrlButton: any = undefined;
    let finalNewState = prev;
    let isAiResponse = false; 

    if (isInteractive || isStandardCommand || isExpectingFreeQuestion || isShortIntentKeyword) {
      // Build the CTA from the actual webhook origin. This prevents a stale
      // NEXT_PUBLIC_BASE_URL value (such as localhost) from reaching users.
      const result = nextMessage(flowInput, prev, req.nextUrl.origin);
      finalReply = result.reply;
      finalButtons = result.buttons;
      finalList = result.list;
      finalImage = result.image;
      finalUrlButton = result.urlButton;
      finalNewState = result.newState;
    } else {
      let aiSuccess = false;
      isAiResponse = true;

      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: incomingText,
            config: {
              systemInstruction: GEMINI_SYSTEM_PROMPT,
              temperature: 0.7, 
            }
          });
          
          finalReply = response.text || "Radhe Radhe 🙏! How can I help you today?";
          finalButtons = ["Main Menu 📋"]; 
          finalNewState = { step: "START", userData: prev.userData }; 
          
          aiSuccess = true;
          break; 

        } catch (geminiError: any) {
          console.warn(`[Gemini Fallback] Model ${modelName} failed:`, geminiError.message);
          if (geminiError.status === 429 || geminiError.message?.includes("429") || geminiError.message?.includes("quota")) {
            console.error("[Gemini Fallback] Free Tier Rate Limit Hit (15 RPM)!");
            break; 
          }
        }
      }

      if (!aiSuccess) {
        finalReply = `Radhe Radhe ${waName} ji 🙏\n\nI understand you are seeking guidance, and I am here to help. To ensure you get the right support, please tap the button below to view our specific consultation services.`;
        finalButtons = ["Main Menu 📋"]; 
        finalNewState = { step: "START", userData: prev.userData };
      }
    }

    const userTimestamp = new Date();
    const botTimestamp = new Date(userTimestamp.getTime() + 1000); 

    const backgroundTasks = async () => {
      await connectDB();
      await Promise.all([
        redis.set(stateKey(from), JSON.stringify(finalNewState), "EX", 86400),
        redis.hset(interactionKey, from, Date.now().toString()),
        redis.hset(namesKey, from, waName),
        
        // 1. Log the User's incoming message
        Chat.create({ 
          phoneNumber: from, waName, message: incomingText, step: finalNewState.step, type: msgType, timestamp: userTimestamp 
        }),

        // 2. Log the Bot's outgoing message
        Chat.create({ 
          phoneNumber: from, waName: "Bot", message: finalReply, step: finalNewState.step, type: isAiResponse ? "bot_ai_response" : "bot_flow_response", timestamp: botTimestamp 
        })
      ]);
    };

    // CRITICAL CONTROL: Execute sending first and inspect response status
    const messageDelivered = await sendWhatsAppMessage(from, finalReply, { buttons: finalButtons, list: finalList, image: finalImage, urlButton: finalUrlButton });
    
    // ONLY update state and log history if message delivery was successful
    if (messageDelivered) {
      await backgroundTasks();
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}
