import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Gem, Sparkles, Flower2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
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
          <h2 id="premium-report-heading" className={`section-title ${styles.heading}`}>
            Premium Surbhi Kundali Report
          </h2>
          <p className={styles.description}>
            Explore your birth chart through detailed, easy-to-understand guidance personally prepared by Surbhi Gupta. Discover your planetary positions, important life patterns, and practical insights for your career, relationships, health, and future.
          </p>

          <h3 className={styles.featuresHeading}>What&apos;s included</h3>
          <div className={styles.features}>
            {features.map(({ Icon, label }) => (
              <div className={styles.feature} key={label}>
                <span className={styles.featureIcon} aria-hidden="true"><Icon size={25} strokeWidth={1.8} /></span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className={styles.purchase}>
            <div className={styles.pricing}>
              <div className={styles.priceLine}>
                <span className={styles.price}>₹999</span>
                <del className={styles.originalPrice}>₹2,999</del>
                <span className={styles.discount}>67% off</span>
              </div>
              <p className={styles.savings}>You save ₹2,000</p>
            </div>
            <div className={styles.ctaWrap}>
              <Link className={`${styles.cta} btn-auto-shine`} href={checkoutHref}>
                <span className={styles.ctaText}>Get My Surbhi Kundali Now</span>
                <ArrowUpRight size={24} strokeWidth={1.9} aria-hidden="true" />
              </Link>
              <Image
                src="/premium-surbhi-kundali-realistic-book.png"
                alt=""
                aria-hidden="true"
                width={82}
                height={82}
                sizes="82px"
                className={styles.ctaBook}
              />
            </div>
            <p className={styles.delivery}>
              <FaWhatsapp aria-hidden="true" />
              Delivered on WhatsApp with 1 free personal question
            </p>
          </div>
        </div>

        <div className={styles.visualWrap}>
          <div className={styles.visual}>
            <Image
              src="/premium-surbhi-kundali-realistic-book.png"
              alt="Premium Surbhi Kundali Report cover mockup showing the bound pages and Surbhi Astrology branding"
              fill
              sizes="(max-width: 520px) 300px, (max-width: 900px) 350px, 410px"
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
