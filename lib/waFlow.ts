// lib/waFlow.ts
import { getCheckoutPlanByWhatsAppSelection, planIncludesWhatsAppQuestion } from "@/lib/checkout-plans";

export type BotStep =
  | "START" | "F2_INTENT" | "F2_HOOK" | "F2_SOLUTION" | "F2_CHECKOUT"
  | "F1_START" | "F1_FREE_QUESTION" | "F1_END";

export type UserData = {
  name?: string;
  intent?: string;
  plan?: string;
  language?: "en" | "hi";
};

export type FlowState = {
  step: BotStep;
  userData: UserData;
};

function isCareerService(intent: string = "") {
  const lowerIntent = intent.toLowerCase();
  return lowerIntent.includes("career") || lowerIntent.includes("business") || lowerIntent.includes("करियर") || lowerIntent.includes("व्यापार");
}

function getServicePlans(intent: string = "", isHi: boolean) {
  const lower = intent.toLowerCase();

  // 1. Surbhi Consultation
  if ((lower.includes("consultation") || lower.includes("परामर्श")) && !lower.includes("couple")) {
    return [{
      title: isHi ? "परामर्श योजनाएं" : "Consultation Plans",
      rows: isHi ? [
        { id: "consultation_video", title: "वीडियो कॉल (₹11,000)", description: "सुरभि जी से 30 मिनट की निजी बातचीत" },
        { id: "consultation_offline", title: "आमने-सामने (₹24,000)", description: "सुरभि जी से व्यक्तिगत मुलाकात" },
        { id: "consultation_priority", title: "प्रायोरिटी (₹51,000)", description: "प्राथमिकता के साथ निजी परामर्श" }
      ] : [
        { id: "consultation_video", title: "Video Call (₹11,000)", description: "30 minutes, one-to-one with Surbhi ji" },
        { id: "consultation_offline", title: "In Person (₹24,000)", description: "A private meeting with Surbhi ji" },
        { id: "consultation_priority", title: "Priority (₹51,000)", description: "Priority personal consultation" }
      ]
    }];
  }

  // 2. Numerology Report
  if (lower.includes("numerology") || lower.includes("अंकशास्त्र")) {
    return [{
      title: isHi ? "अंकशास्त्र योजनाएं" : "Numerology Plans",
      rows: isHi ? [
        { id: "p1", title: "नाम चेक (₹1,100)", description: "वर्तमान नाम का विस्तृत विश्लेषण" },
        { id: "p2", title: "नाम सुधार (₹5,100)", description: "सुधारे गए नाम सुझावों के साथ रिपोर्ट" },
        { id: "p3", title: "कॉल सहित (₹11,000)", description: "सुरभि जी के साथ 30 मिनट का कॉल" }
      ] : [
        { id: "p1", title: "Basic (₹1,100)", description: "Detailed vibration analysis of current name" },
        { id: "p2", title: "Correction (₹5,100)", description: "Report + Corrected name suggestions" },
        { id: "p3", title: "With Call (₹11,000)", description: "Report + 30-Min Call with Surbhi Gupta" }
      ]
    }];
  }

  // 3. Couple Match Making
  if (lower.includes("couple") || lower.includes("match") || lower.includes("मिलान")) {
    return [{
      title: isHi ? "कुंडली मिलान योजनाएं" : "Match Making Plans",
      rows: isHi ? [
        { id: "p1", title: "कपल रिपोर्ट (₹1,100)", description: "विस्तृत अनुकूलता रिपोर्ट" },
        { id: "p2", title: "रिपोर्ट+Q (₹3,300)", description: "रिपोर्ट + WhatsApp पर 1 व्यक्तिगत प्रश्न" },
        { id: "p3", title: "रिपोर्ट+कॉल (₹11,000)", description: "रिपोर्ट + ऑन-कॉल परामर्श" },
        { id: "p4", title: "कपल कॉल (₹15,000)", description: "सुरभि जी के साथ 30 मिनट की कॉल" }
      ] : [
        { id: "p1", title: "Basic Match (₹1,100)", description: "Detailed compatibility report" },
        { id: "p2", title: "Match + 1Q (₹3,300)", description: "Report + Ask 1 question on WhatsApp" },
        { id: "p3", title: "Match+Call (₹11,000)", description: "Report + On-Call Consultation" },
        { id: "p4", title: "Direct Call (₹15,000)", description: "30-Min direct call with Surbhi Gupta" }
      ]
    }];
  }

  // 4. Baby Name Report
  if (lower.includes("baby") || lower.includes("बच्चों")) {
    return [{
      title: isHi ? "बेबी नाम योजनाएं" : "Baby Name Plans",
      rows: isHi ? [
        { id: "p1", title: "बेबी रिपोर्ट (₹1,100)", description: "ज्योतिष और अंकशास्त्र रिपोर्ट" },
        { id: "p2", title: "रिपोर्ट+नाम (₹5,100)", description: "रिपोर्ट + नाम सुझाव + 1 प्रश्न" },
        { id: "p3", title: "कॉल सहित (₹11,000)", description: "रिपोर्ट + नाम + 30 मिनट का कॉल" }
      ] : [
        { id: "p1", title: "Baby Report (₹1,100)", description: "Astrology & Numerology Report" },
        { id: "p2", title: "Report+Name (₹5,100)", description: "Report + Name Suggestions + 1 Question" },
        { id: "p3", title: "Premium Call (₹11,000)", description: "Report + Names + 30-Min Consultation" }
      ]
    }];
  }

  // Default: Surbhi Kundali.
  return [{
    title: isHi ? "कुंडली योजनाएं" : "Kundli Plans",
    rows: isHi ? [
      { id: "kundli_999", title: "10-वर्ष कुंडली (₹999)", description: "रिपोर्ट + सूची में से 1 प्रश्न चुनें" },
      { id: "kundli_2999", title: "निजी प्रश्न (₹2,999)", description: "रिपोर्ट + अपना 1 सवाल खुद लिखें" },
      { id: "kundli_11000", title: "रिपोर्ट + कॉल (₹11,000)", description: "रिपोर्ट और सुरभि जी से निजी कॉल" }
    ] : [
      { id: "kundli_999", title: "10-Year Report (₹999)", description: "Report + choose 1 suggested question" },
      { id: "kundli_2999", title: "Personal Q (₹2,999)", description: "Report + write 1 question of your own" },
      { id: "kundli_11000", title: "Report + Call (₹11,000)", description: "Report + private call with Surbhi ji" }
    ]
  }];
}

export function nextMessage(
  input: string,
  state: FlowState,
  publicBaseUrl?: string
): { reply: string; buttons?: string[]; list?: any; image?: string; urlButton?: { text: string; url: string }; newState: FlowState } {
  const msg = input.trim();
  const lowerMsg = msg.toLowerCase();
  const currentState = state?.step ? state : { step: "START" as BotStep, userData: {} };
  const data = { ...currentState.userData };

  const baseUrl = publicBaseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  // Meta cannot fetch images behind Vercel Preview Protection. Keep checkout
  // links on preview, but load the same public images from production.
  const mediaBaseUrl = process.env.VERCEL_ENV === "preview"
    ? "https://kundalireport.surabhiastrology.com"
    : baseUrl;
  const paymentLink = `${baseUrl}/checkout`;
  const imgWelcome = `${mediaBaseUrl}/celebs/8.png`;
  const imgServices = "https://pbs.twimg.com/profile_images/2027040849813721088/X4RajwNP.jpg"; 

  const isHi = data.language === "hi";
  const userName = data.name && data.name !== "Seeker" ? data.name : "";

  const serviceNames = [
    "surbhi consultation", "surbhi_consultation", "surbhi  kundali ", "surbhi_kundli", "numerology report", "numerology_report",
    "couple match making", "couple_match_making", "baby name report", "baby_name_report", "career", "love", "health", "money", "family",
    "सुरभि गुप्ता परामर्श", "सुरभि कुंडली", "अंकशास्त्र रिपोर्ट", "कुंडली मिलान", "बच्चों के नाम की रिपोर्ट"
  ];
  const isSelectingNewService = serviceNames.some(s => lowerMsg.includes(s.toLowerCase()));
  const isPlanRowId = /^p[1-4]$/.test(lowerMsg);

  if (isSelectingNewService && (currentState.step === "F2_CHECKOUT" || currentState.step === "F2_HOOK")) {
    currentState.step = "F2_HOOK";
  }

  // A row ID without its service context means the user tapped an old WhatsApp
  // menu after the conversation state changed. Do not treat p1/p2 as a new
  // service; reset the flow instead of creating a loop.
  if (currentState.step === "F2_HOOK" && isPlanRowId) {
    return {
      reply: "That previous menu has expired. Please tap Main Menu to choose your service again.",
      buttons: ["Main Menu"],
      newState: { step: "START", userData: { name: data.name } },
    };
  }

  if (lowerMsg === "restart" || lowerMsg === "hi" || lowerMsg === "hello" || lowerMsg === "hi surbhi") {
    return {
      reply: `🙏 Namaste and welcome🙏\n\nLet us know which language are you more comfortable talking with; our expert will connect with you in the same language 👇\n\n🙏 नमस्ते और स्वागत है   🙏\n\nकृपया बताएं कि आप किस भाषा में बात करना अधिक पसंद करेंगे; हमारे विशेषज्ञ आपसे उसी भाषा में जुड़ेंगे 👇`,
      buttons: ["English 🇬🇧", "हिंदी 🇮🇳"],
      image: imgWelcome,
      newState: { step: "F2_INTENT", userData: { name: userName } },
    };
  }

  if (lowerMsg === "more") {
    return nextMessage(isHi ? "हिंदी" : "English", { step: "F2_INTENT", userData: data }, publicBaseUrl);
  }

  if (lowerMsg === "paid") {
    if (data.intent === "Surbhi Kundali - 10-Yr Report + 1Question" ||
        data.intent === "Surbhi Kundali - Report + 1Question") {
      return {
        reply: isHi
          ? "✅ *भुगतान की पुष्टि हो गई है।*\nचेकआउट पर चुना या लिखा गया आपका सवाल हमें मिल गया है। आपको इसे दोबारा भेजने की ज़रूरत नहीं है।"
          : "✅ *Payment confirmed.*\nWe have your question from checkout. You do not need to send it again.",
        newState: { step: "F1_END", userData: data },
      };
    }
    if (planIncludesWhatsAppQuestion(data.intent) || data.plan?.toLowerCase().includes("1question") || isCareerService(data.intent)) {
      return {
        reply: isHi 
          ? "✅ *भुगतान की पुष्टि हो गई है।*\nआपकी योजना में शामिल एक सवाल भेजने के लिए नीचे टैप करें 👇"
          : "✅ *Payment Confirmed!*\nYour order has been confirmed. Tap below to send your included question 👇",
        buttons: isHi ? ["प्रश्न पूछें"] : ["Ask Question"],
        newState: { step: "F1_START", userData: data },
      };
    } else {
      return {
        reply: isHi 
          ? "✅ *भुगतान सफल!*\nआपका ऑर्डर कन्फर्म हो गया है। आपका मार्गदर्शन जल्द ही यहीं भेजा जाएगा।"
          : "✅ *Payment Confirmed!*\nYour order has been confirmed. Your guidance will be delivered right here shortly.",
        newState: { step: "F1_END", userData: data },
      };
    }
  }

  switch (currentState.step) {
    case "START":
      return {
        reply: `🙏 Namaste and welcome🙏\n\n Please select your language 👇\n\n🙏 नमस्ते और स्वागत है   🙏\n\n कृपया अपनी भाषा चुनें 👇`,
        buttons: ["English 🇬🇧", "हिंदी 🇮🇳"],
        image: imgWelcome,
        newState: { step: "F2_INTENT", userData: data },
      };

    case "F2_INTENT":
      data.language = (lowerMsg.includes("hindi") || lowerMsg.includes("हिंदी")) ? "hi" : "en";
      const isHindi = data.language === "hi";
      return {
        reply: isHindi
          ? `🙏 राधे राधे${userName ? ", " + userName + " जी" : ""}।\nसेलिब्रिटी ज्योतिषी सुरभि गुप्ता जी की ओर से आपका स्वागत है।\n\n✨ सुरभि जी से सीधे बात करना चाहते हैं या अपनी व्यक्तिगत रिपोर्ट देखना चाहते हैं? नीचे अपनी ज़रूरत चुनें।`
          : `🙏 Radhe Radhe${userName ? ", " + userName : ""}.\nWelcome to the official guidance service of celebrity astrologer Surbhi Gupta ji.\n\n✨ Looking to speak with Surbhi ji or explore a personal report? Choose what you need below.`,
        image: imgServices,
        list: {
          button: isHindi ? "यहाँ चुनें" : "Select Here",
          sections: [
            {
              title: isHindi ? "विशिष्ट समस्याएं" : "Specific Problems",
              rows: isHindi ? [
                { id: "career", title: "करियर और व्यापार", description: "नौकरी, पदोन्नति and व्यवसाय" },
                { id: "love", title: "विवाह और रिश्ते", description: "प्रेम समस्याओं का समाधान" },
                { id: "money", title: "धन और वित्त", description: "आर्थिक स्थिति और धन लाभ" },
                { id: "health", title: "स्वास्थ्य समस्याएं", description: "स्वास्थ्य और उपाय" },
                { id: "family", title: "पारिवारिक चिंताएं", description: "पारिवारिक शांति और विवाद" }
              ] : [
                { id: "career", title: "Career & Business", description: "Job, promotion, and business growth" },
                { id: "love", title: "Marriage & Relationships", description: "Navigating love & breakups" },
                { id: "money", title: "Money & Finances", description: "Wealth and financial stability" },
                { id: "health", title: "Health Issues", description: "Health concerns and remedies" },
                { id: "family", title: "Family Concerns", description: "Family peace and disputes" }
              ]
            },
            {
              title: isHindi ? "रिपोर्ट और परामर्श" : "Reports & Consultation",
              rows: isHindi ? [
                { id: "surbhi_kundli", title: "सुरभि कुंडली", description: "आपकी व्यक्तिगत कुंडली" },
                { id: "surbhi_consultation", title: "सुरभि जी से परामर्श", description: "वीडियो कॉल या आमने-सामने मुलाकात" },
                { id: "numerology_report", title: "अंकशास्त्र रिपोर्ट", description: "नाम सुझाव और व्याख्या" },
                { id: "couple_match_making", title: "कुंडली मिलान", description: "सफल विवाह के लिए" },
                { id: "baby_name_report", title: "बच्चों के नाम की रिपोर्ट", description: "सार्थक नामों के सुझाव" }
              ] : [
                { id: "surbhi_kundli", title: "Surbhi Kundali", description: "Your personal birth-chart report" },
                { id: "surbhi_consultation", title: "Speak with Surbhi ji", description: "Private video or in-person session" },
                { id: "numerology_report", title: "Numerology Report", description: "Name suggestions & meaning" },
                { id: "couple_match_making", title: "Couple Match Making", description: "Kundali Milan for marriage" },
                { id: "baby_name_report", title: "Baby Name Report", description: "Meaningful baby names" }
              ]
            }
          ]
        },
        newState: { step: "F2_HOOK", userData: data },
      };

    case "F2_HOOK":
      data.intent = msg;
      
      let hookReply = "";
      const selectedIntent = msg.toLowerCase();

      if (selectedIntent.includes("career") || selectedIntent.includes("business") || selectedIntent.includes("love") || selectedIntent.includes("marriage") || selectedIntent.includes("money") || selectedIntent.includes("health") || selectedIntent.includes("family") || selectedIntent.includes("करियर") || selectedIntent.includes("व्यापार") || selectedIntent.includes("प्रेम") || selectedIntent.includes("विवाह") || selectedIntent.includes("धन") || selectedIntent.includes("स्वास्थ्य") || selectedIntent.includes("परिवार")) {
        hookReply = isHi
          ? `मैं *${msg}* को लेकर आपकी चिंता समझता हूँ। 🌟\nइस विषय पर आगे बढ़ने के लिए आप सुरभि जी की व्यक्तिगत कुंडली रिपोर्ट चुन सकते हैं या उनसे सीधे परामर्श ले सकते हैं।\n\n👇 आप किस तरह का मार्गदर्शन पसंद करेंगे?`
          : `I understand your concern about *${msg}*. 🌟\nThere are two ways to get guidance: a personalized Surbhi Kundali report, or a direct consultation with Surbhi ji.\n\n👇 Which would you prefer?`;
        data.intent = msg;
        return {
          reply: hookReply,
          list: {
            button: isHi ? "विकल्प चुनें" : "Choose an option",
            sections: [{
              title: isHi ? "आपका मार्गदर्शन" : "Your guidance",
              rows: isHi ? [
                { id: "surbhi_kundli", title: "सुरभि कुंडली रिपोर्ट", description: "व्यक्तिगत रिपोर्ट और जीवन मार्गदर्शन" },
                { id: "surbhi_consultation", title: "सुरभि जी से परामर्श", description: "सीधे व्यक्तिगत मार्गदर्शन के लिए" }
              ] : [
                { id: "surbhi_kundli", title: "Surbhi Kundali Report", description: "Personalized report and life guidance" },
                { id: "surbhi_consultation", title: "Consultation with Surbhi", description: "Speak directly for personal guidance" }
              ]
            }]
          },
          newState: { step: "F2_SOLUTION", userData: data },
        };
      } else if (selectedIntent.includes("kundli") || selectedIntent.includes("कुंडली")) {
        hookReply = isHi
          ? `🌙 *सुरभि कुंडली*\nसुरभि जी आपके जन्म विवरण के आधार पर आपकी व्यक्तिगत रिपोर्ट तैयार करेंगी।\n\n✨ ₹999 में दिए गए सवालों में से एक चुनें। ₹2,999 में अपना एक सवाल खुद लिखें।\n\n👇 अपना विकल्प चुनें।`
          : `🌙 *Surbhi Kundali*\nSurbhi ji will prepare your personal report using your birth details.\n\n✨ At ₹999, choose one question from our suggested list. At ₹2,999, write one question in your own words.\n\n👇 Choose the guidance that suits you.`;
      } else if (selectedIntent.includes("consultation") || selectedIntent.includes("परामर्श")) {
        hookReply = isHi
          ? `✨ *सुरभि जी से निजी परामर्श*\nअपनी बात सीधे सुरभि जी के साथ साझा करें। वीडियो कॉल या आमने-सामने मुलाकात में से अपना पसंदीदा तरीका चुनें।\n\n👇 उपलब्ध विकल्प देखें।`
          : `✨ *A private consultation with Surbhi ji*\nSpeak with her directly about what matters to you. Choose a video call or meet her in person.\n\n👇 Explore your options.`;
      } else {
        hookReply = isHi
          ? `💼 ${msg} को लेकर सही मार्गदर्शन पाने के लिए, हम ये सेवाएँ सुझाते हैं।\n\n 👇 नीचे अपना पसंदीदा विकल्प चुनें। \n\n कोई दूसरी सेवा देखनी है? बस MORE टाइप करें।`
          : `💼 It's about knowing the right direction.\nTo help you gain clarity regarding *${msg}*, we recommend these services:\n\n👇 Choose an option below.\n(Need a different service? Reply MORE.)`;
      }

      return {
        reply: hookReply,
        list: {
          button: isHi ? "समाधान देखें" : "View Solutions",
          sections: getServicePlans(data.intent, isHi)
        },
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    case "F2_SOLUTION": {
      const selected = lowerMsg;
      if (!["surbhi_kundli", "surbhi_consultation"].includes(selected)) {
        return {
          reply: isHi ? "कृपया सूची से कुंडली रिपोर्ट या परामर्श चुनें।" : "Please choose either the Kundali report or consultation from the list.",
          buttons: ["Main Menu"],
          newState: { step: "START", userData: { name: data.name, language: data.language } },
        };
      }

      data.intent = selected;
      return {
        reply: selected === "surbhi_consultation"
          ? (isHi ? "✨ सुरभि जी से सीधे बात करने के लिए अपना परामर्श विकल्प चुनें:" : "✨ To speak directly with Surbhi ji, choose your consultation format:")
          : (isHi ? "🌙 सुरभि कुंडली में सूची से चुना गया सवाल या अपना लिखा सवाल, दोनों विकल्प उपलब्ध हैं:" : "🌙 Choose between a suggested question and one written in your own words:"),
        list: { button: isHi ? "योजना चुनें" : "Choose a plan", sections: getServicePlans(selected, isHi) },
        newState: { step: "F2_CHECKOUT", userData: data },
      };
    }

    case "F2_CHECKOUT":
      const checkoutPlan = getCheckoutPlanByWhatsAppSelection(data.intent, msg);

      if (!checkoutPlan) {
        return {
          reply: "That previous menu has expired. Please tap Main Menu to choose your service again.",
          buttons: ["Main Menu"],
          newState: { step: "START", userData: { name: data.name } },
        };
      }

      data.plan = checkoutPlan.plan;
      const encodedService = encodeURIComponent(checkoutPlan.service);
      const encodedPlan = encodeURIComponent(checkoutPlan.plan);
      const checkoutUrl = `${paymentLink}?service=${encodedService}&plan=${encodedPlan}`;

      const selectedService = (data.intent || "").toLowerCase();
      const isSurbhiKundli = selectedService === "surbhi_kundli" || selectedService.includes("सुरभि कुंडली");
      const checkoutImage = isSurbhiKundli ? `${mediaBaseUrl}/surbhi-15.png` : `${mediaBaseUrl}/surbhi-16.png`;
      
      let checkoutMsg = isHi
        ? `धन्यवाद! 🌟\n\nअपने अनुरोध की पुष्टि करने और अपनी बुकिंग सुरक्षित करने के लिए, कृपया नीचे दिए गए *'Complete Payment'* बटन पर क्लिक करें। 👇`
        : `Thank you! 🌟\n\nTo confirm your request and secure your booking, please click the *'Complete Payment'* button below 👇`;
        
      if (checkoutPlan.whatsappSelection?.planId === "kundli_999") {
        checkoutMsg += isHi
          ? `\n\n✨ चेकआउट पर सूची में से अपना एक सवाल चुनें।`
          : `\n\n✨ Choose one question from the suggested list at checkout.`;
      } else if (checkoutPlan.whatsappSelection?.planId === "kundli_2999") {
        checkoutMsg += isHi
          ? `\n\n✨ चेकआउट पर अपना एक सवाल अपने शब्दों में लिखें।`
          : `\n\n✨ Write your one personal question at checkout.`;
      }

      return {
        reply: checkoutMsg,
        image: checkoutImage, 
        urlButton: {
          text: isHi ? "Complete Payment " : "Complete Payment ",
          url: checkoutUrl
        },
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    case "F1_START":
      if (!lowerMsg.includes("ask question") && !lowerMsg.includes("प्रश्न पूछें")) {
        return {
          reply: isHi
            ? "🙏 धन्यवाद। आपका प्रश्न मिल गया है। सुरभि जी इसकी समीक्षा करके जल्द ही यहीं जवाब देंगी।"
            : "🙏 Thank you. Your question has been received. Surbhi ji will review it and reply here shortly.",
          newState: { step: "F1_END", userData: data },
        };
      }
      return {
        reply: isHi
          ? "✨ *ज़रूर।*\n\nआपकी योजना में एक सवाल शामिल है। अपना सवाल इसी चैट में लिखकर भेजें।"
          : "✨ *Of course.*\n\nYour plan includes one question. Please type and send it here.",
        newState: { step: "F1_FREE_QUESTION", userData: data },
      };

    case "F1_FREE_QUESTION":
      return {
        reply: isHi
          ? `🙏 धन्यवाद। आपका प्रश्न मिल गया है। सुरभि जी इसकी समीक्षा करके जल्द ही यहीं जवाब देंगी।`
          : `🙏 Thank you. Your question has been received. Surbhi ji will review it and reply here shortly.`,
        newState: { step: "F1_END", userData: data },
      };

    case "F1_END":
      return {
        reply: isHi
          ? "विश्लेषण जारी है! ⏳ आपका अपडेट जल्द ही यहाँ भेजा जाएगा।"
          : "Analysis in progress! ⏳ Your update will be here shortly.",
        buttons: ["Restart 🔄"],
        newState: { step: "F1_END", userData: data },
      };

    default:
      return {
        reply: `🙏 Radhe Radhe Pranam! Reply *Restart* to begin.`,
        buttons: ["Restart 🔄"],
        newState: { step: "START", userData: data },
      };
  }
}
