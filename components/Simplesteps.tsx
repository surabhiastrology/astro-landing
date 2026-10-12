import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FilePenLine, Gift, Lightbulb, ScanSearch, ScrollText } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import styles from "./Simplesteps.module.css";

const steps = [
  {
    title: "Share Your Details",
    description: "Enter your name, date of birth, time and place.",
    image: "/section-steps/share-details.webp",
    alt: "A person writing birth details on a form",
    Icon: FilePenLine,
  },
  {
    title: "Your Kundali Is Prepared",
    description: "Your Vedic birth chart is created using astrological calculations.",
    image: "/section-steps/kundali-chart.webp",
    alt: "A Vedic birth chart drawn on handmade paper",
    Icon: ScrollText,
  },
  {
    title: "Analyzed by Surbhi Gupta",
    description: "Surbhi personally reviews your chart and its important patterns.",
    image: "/section-steps/personal-analysis.webp",
    alt: "An astrologer reviewing a birth chart on a laptop",
    Icon: ScanSearch,
  },
  {
    title: "Key Insights Identified",
    description: "Discover strengths, challenges, important timings and practical guidance.",
    image: "/section-steps/key-insights.webp",
    alt: "A notebook prepared for personalized life insights",
    Icon: Lightbulb,
  },
  {
    title: "Receive Your Report",
    description: "Get your personalized Kundali report and answer on WhatsApp.",
    image: "/section-steps/report-delivery.webp",
    alt: "A finished cream Kundali report with a gold zodiac design",
    Icon: Gift,
  },
];

export default function HowItWorksSection() {
  return (
    <section className={styles.section} aria-labelledby="kundali-steps-heading">
      <div className={styles.ornamentLeft} aria-hidden="true" />
      <div className={styles.ornamentRight} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.heading}>
          <SectionEyebrow className="mb-4">Simple &amp; Personalized</SectionEyebrow>
          <h2 id="kundali-steps-heading" className={`section-title ${styles.title}`}>
            Your Surbhi Kundali in <span>5 Simple Steps</span>
          </h2>
          <p className={styles.intro}>
            From your birth details to guidance prepared for you—a clear,
            personal process from start to finish.
          </p>
        </div>

        <ol className={styles.steps}>
          {steps.map(({ title, description, image, alt, Icon }, index) => (
            <li className={styles.step} key={title}>
              <div className={styles.imageShell}>
                <div className={styles.imageFrame}>
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="(max-width: 639px) 88vw, (max-width: 1023px) 44vw, 20vw"
                    className={styles.stepImage}
                  />
                </div>
                <span className={styles.number} aria-label={`Step ${index + 1}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.iconBadge} aria-hidden="true">
                  <Icon size={27} strokeWidth={1.7} />
                </span>
              </div>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepDescription}>{description}</p>
            </li>
          ))}
        </ol>

        <div className={styles.closing}>
          <Link
            href="/checkout?service=Surbhi%20Kundali&plan=10-Yr%20Report%20%2B%201Question%20(%E2%82%B9999)"
            className={`hero-cta-shimmer steps-cta-shimmer ${styles.cta}`}
          >
            <span className={styles.ctaText}>Get Your Premium Surbhi Kundali</span>
            <span className={styles.ctaArrow} aria-hidden="true"><ArrowUpRight size={20} strokeWidth={2} /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
