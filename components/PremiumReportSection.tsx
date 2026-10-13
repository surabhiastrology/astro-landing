import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Gem, Sparkles, Flower2 } from "lucide-react";
import styles from "./PremiumReportSection.module.css";

const features = [
  { Icon: Flower2, label: "Special Mantras & Vedic Chants" },
  { Icon: Gem, label: "Specialized Gem Suggestions" },
  { Icon: Sparkles, label: "Manifestation + Astrology" },
  { Icon: BookOpen, label: "Laal Kitab & Nakshatra Guidance" },
];

export default function PremiumReportSection({ checkoutHref }: { checkoutHref: string }) {
  return (
    <section className={styles.section} aria-labelledby="premium-report-heading">
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>Deep Vedic Analysis</span>
          <h2 id="premium-report-heading" className={`section-title ${styles.heading}`}>
            Get Your Premium <span>Surbhi Kundali Report</span>
          </h2>
          <p className={styles.description}>
            Explore your birth chart through detailed, easy-to-understand guidance personally prepared by Surbhi Gupta. Discover your planetary positions, important life patterns, and practical insights for your career, relationships, health, and future.
          </p>

          <div className={styles.features} aria-label="What the report includes">
            {features.map(({ Icon, label }) => (
              <div className={styles.feature} key={label}>
                <span className={styles.featureIcon} aria-hidden="true"><Icon size={25} strokeWidth={1.8} /></span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className={styles.purchase}>
            <div className={styles.pricing}>
              <span className={styles.priceLabel}>Total Value</span>
              <div className={styles.priceLine}>
                <span className={styles.price}>₹999</span>
                <del className={styles.originalPrice}>₹2999</del>
              </div>
            </div>
            <Link className={`${styles.cta} btn-auto-shine`} href={checkoutHref}>
              <span>Get My Surbhi Kundali Now</span>
              <ArrowUpRight size={24} strokeWidth={1.9} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <Image
            src="/premium-surbhi-kundali-book-display.webp"
            alt="Premium Surbhi Kundali Report book displayed in a warm Vedic astrology setting"
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
            className={styles.image}
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
