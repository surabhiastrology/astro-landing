import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Compass, Sparkles, UsersRound } from "lucide-react";
import styles from "./TrustSurbhiSection.module.css";

const checkoutHref = "/checkout?service=Surbhi%20Kundali&plan=10-Yr%20Report%20%2B%201Question%20(%E2%82%B9999)";

const reasons = [
  { value: "35+ Years", label: "in Occult Science", Icon: Sparkles },
  { value: "1,50,000+", label: "people worldwide", Icon: UsersRound },
  { value: "Personalized", label: "guidance for your path", Icon: BookOpenText },
  { value: "Practical", label: "solution-driven approach", Icon: Compass },
];

export default function TrustSurbhiSection() {
  return (
    <section className={styles.section} aria-labelledby="trust-surbhi-heading">
      <div className={styles.shell}>
        <div className={styles.copy}>
          <h2 id="trust-surbhi-heading" className={`section-title ${styles.heading}`}>
            Why People Trust <span>Surbhi Gupta</span>
          </h2>

          <p className={styles.description}>
            Celebrity Astrologer Surbhi Gupta personally prepares your Kundali
            with guidance shaped by her expertise in Astrology, Vastu and
            Numerology. Her thoughtful insights help you find clarity in
            life&apos;s important decisions.
          </p>

          <blockquote className={styles.quote}>
            <strong>Your destiny is precious.</strong>
            <span>Don&apos;t leave it to guesswork.</span>
          </blockquote>

          <ul className={styles.reasons} aria-label="Why clients trust Surbhi Gupta">
            {reasons.map(({ value, label, Icon }) => (
              <li className={styles.reason} key={value}>
                <span className={styles.reasonIcon} aria-hidden="true">
                  <Icon size={23} strokeWidth={1.65} />
                </span>
                <strong>{value}</strong>
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <Link href={checkoutHref} className={`hero-cta-shimmer ${styles.cta}`}>
            <span className={styles.ctaText}>Get Your Personalized Guidance</span>
            <ArrowUpRight className={styles.ctaArrow} size={21} strokeWidth={2} aria-hidden="true" />
          </Link>

          <p className={styles.specialties}>Astrology <span aria-hidden="true">•</span> Vastu <span aria-hidden="true">•</span> Numerology</p>
        </div>

        <div className={styles.visual}>
          <Image
            src="/surbhi-gupta-trust-portrait.webp"
            alt="Celebrity Astrologer Surbhi Gupta"
            width={858}
            height={910}
            sizes="(max-width: 767px) 100vw, 50vw"
            className={styles.portrait}
          />
        </div>
      </div>
    </section>
  );
}
