import Image from "next/image";
import SectionEyebrow from "./SectionEyebrow";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import styles from "./KundaliFaqSection.module.css";

const questions = [
  {
    question: "What makes the Premium Surbhi Kundali different?",
    answer: <>Your Kundali is personalized using your birth details and <strong>personally reviewed by Celebrity Astrologer Surbhi Gupta</strong> — not treated like a generic automated report.</>,
    Icon: ShieldCheck,
  },
  {
    question: "What details are required to prepare my Kundali?",
    answer: <>Your name, date of birth, birth time, place of birth, and preferred report language.</>,
    Icon: CalendarDays,
  },
  {
    question: "What will I receive in the report?",
    answer: <>Personalized insights covering <strong>life patterns, career, relationships, wealth, health, important timings, dosha/yoga analysis, predictions, and remedies.</strong></>,
    Icon: FileText,
  },
  {
    question: "Is the FREE WhatsApp question really included?",
    answer: <>Yes. After receiving your Kundali, you can ask <strong>1 personal question on WhatsApp</strong>, and Surbhi Gupta will review your Kundali and respond with a <strong>personal voice note</strong>.</>,
    Icon: MessageCircle,
  },
  {
    question: "What if I don’t know my exact birth time?",
    answer: <>You can still submit your details using the approximate-time option where available. Exact birth data can help make the analysis more precise.</>,
    Icon: Clock3,
  },
  {
    question: "How will I receive my Surbhi Kundali?",
    answer: <>Your personalized report is delivered digitally, with updates and guidance available through <strong>WhatsApp and email</strong>.</>,
    Icon: MessageCircle,
  },
];

export default function KundaliFaqSection() {
  return (
    <section className={styles.section} aria-labelledby="kundali-faq-heading">
      <div className={styles.shell}>
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.arch}>
            <span className={styles.lotus}>✧</span>
          </div>
          <Image
            className={styles.portrait}
            src="/surbhi-kundali-guidance.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 38vw"
          />
        </div>

        <div className={styles.content}>
          <div className={styles.intro}>
            <SectionEyebrow>Frequently Asked Questions</SectionEyebrow>
            <h2 id="kundali-faq-heading" className={`section-title ${styles.heading}`}>
              Your Questions,<br /><span>Answered Clearly</span>
            </h2>
            <p>Find quick answers about your Surbhi Kundali Report, the process, delivery, and personalized guidance.</p>
          </div>

          <div className={styles.list}>
            {questions.map(({ question, answer, Icon }, index) => (
              <details className={styles.item} name="kundali-faq" key={question} open={index === 0}>
                <summary className={styles.question}>
                  <span className={styles.icon}><Icon size={24} strokeWidth={1.8} aria-hidden="true" /></span>
                  <span className={styles.questionText}>{question}</span>
                  <ChevronDown className={styles.chevron} size={22} strokeWidth={2} aria-hidden="true" />
                </summary>
                <div className={styles.answer}>{answer}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
