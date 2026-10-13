import { CalendarDays, ChartNoAxesCombined, FileText } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import {
  GemstoneIcon,
  LifeBookIcon,
  MarriageRingsIcon,
  PlanetYogaIcon,
  RemediesIcon,
  ZodiacClockIcon,
} from "./ReportFeatureIcons";
import SectionEyebrow from "./SectionEyebrow";
import styles from "./WhatsInsideSection.module.css";

const coreFeatures = [
  {
    Icon: LifeBookIcon,
    badge: "Core",
    title: "Personality & Life Analysis",
    description: "Understand your nature, strengths, and life path.",
    tone: styles.maroon,
  },
  {
    Icon: ZodiacClockIcon,
    badge: "Core",
    title: "10-Year Predictions",
    description: "Year-by-year guidance for important life events.",
    tone: styles.navy,
  },
  {
    Icon: GemstoneIcon,
    badge: "Special",
    title: "Gemstone & Rudraksha",
    description: "Personalized suggestions and wearing guidance.",
    tone: styles.olive,
  },
  {
    Icon: RemediesIcon,
    badge: "Special",
    title: "Remedies & Puja Guidance",
    description: "Practical Vedic remedies for life’s challenges.",
    tone: styles.umber,
  },
  {
    Icon: MarriageRingsIcon,
    badge: "Special",
    title: "Marriage, Career & Wealth",
    description: "Insights for relationships, work, and finances.",
    tone: styles.forest,
  },
  {
    Icon: PlanetYogaIcon,
    badge: "Special",
    title: "Dosha & Yoga Analysis",
    description: "Explore Shani, Mangalik, Kaal Sarp, Raj Yog, and more.",
    tone: styles.plum,
  },
];

const extras = [
  {
    Icon: FileText,
    badge: "Bonus",
    title: "Detailed Report on Every Area of Your Life",
    description: "A complete Vedic Surbhi Kundali report for every aspect of life.",
  },
  {
    Icon: CalendarDays,
    badge: "Exclusive",
    title: "In-Depth Year-by-Year Analysis",
    description: "A decade of guidance for your major decisions.",
  },
  {
    Icon: ChartNoAxesCombined,
    badge: "Special",
    title: "Astrograph / Bhavphal Chart",
    description: "Personalized astrograph and horoscope analysis.",
  },
  {
    Icon: FaWhatsapp,
    badge: "Free",
    title: "1 Personalized WhatsApp Question",
    description: "A personal answer from Surbhi Gupta on WhatsApp.",
    whatsapp: true,
  },
];

export default function WhatsInsideSection() {
  return (
    <section className={styles.section} aria-labelledby="whats-inside-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <SectionEyebrow>Everything Included</SectionEyebrow>
          <h2 id="whats-inside-heading" className={`section-title ${styles.heading}`}>
            What’s Inside Your <span>Premium Surbhi Kundali</span>
          </h2>
        </div>

        <div className={styles.coreGrid}>
          {coreFeatures.map(({ Icon, badge, title, description, tone }) => (
            <article className={`${styles.coreCard} ${tone}`} key={title}>
              <span className={styles.badge}>{badge}</span>
              <span className={styles.iconHalo} aria-hidden="true"><Icon /></span>
              <h3>{title}</h3>
              <span className={styles.divider} aria-hidden="true">✦</span>
              <p>{description}</p>
            </article>
          ))}
        </div>

        <div className={styles.extraGrid}>
          {extras.map(({ Icon, badge, title, description, whatsapp }) => (
            <article className={`${styles.extraCard} ${whatsapp ? styles.whatsappCard : ""}`} key={title}>
              <div className={styles.extraTop}>
                <span className={styles.extraIcon} aria-hidden="true"><Icon size={whatsapp ? 30 : 27} /></span>
                <span className={styles.extraBadge}>{badge}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
