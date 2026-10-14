import Image from "next/image";
import { ArrowRight, Sparkle } from "lucide-react";
import styles from "./FeaturedPredictionSection.module.css";

export default function FeaturedPredictionSection() {
  return (
    <section className={styles.section} aria-labelledby="featured-prediction-heading">
      <div className={styles.card}>
        <div className={`${styles.portrait} ${styles.modiPortrait}`}>
          <Image
            src="/narendra-modi-feature.jpg"
            alt="Narendra Modi seated beside the Indian flag"
            fill
            sizes="(max-width: 820px) 50vw, 38vw"
            quality={50}
            className={styles.modiImage}
          />
        </div>
        <div className={`${styles.portrait} ${styles.surbhiPortrait}`}>
          <Image
            src="/surbhi-narendra.JPG"
            alt="Astrologer Surbhi Gupta seated at her desk"
            fill
            sizes="(max-width: 820px) 50vw, 40vw"
            quality={50}
            className={styles.surbhiImage}
          />
        </div>

        <span className={`${styles.star} ${styles.starOne}`} aria-hidden="true">✦</span>
        <span className={`${styles.star} ${styles.starTwo}`} aria-hidden="true">✦</span>
        <span className={`${styles.star} ${styles.starThree}`} aria-hidden="true">✧</span>

        <div className={styles.content}>
          <p className={styles.eyebrow}><Sparkle size={14} aria-hidden="true" /> Featured Prediction <Sparkle size={14} aria-hidden="true" /></p>
          <h2 id="featured-prediction-heading" className={styles.heading}>Narendra Modi</h2>
          <p className={styles.subtitle}>Prime Minister of India</p>
          <div className={styles.divider} aria-hidden="true"><span>✧</span></div>
          <p className={styles.description}>
            Explore Surbhi Gupta&apos;s archived prediction about Narendra Modi&apos;s path to national leadership.
          </p>
          <a className={`${styles.cta} btn-auto-shine`} href="/narendra-modi.jpg" target="_blank" rel="noopener noreferrer">
            <span>Explore the Prediction</span>
            <ArrowRight size={20} strokeWidth={1.8} aria-hidden="true" />
          </a>
          <p className={styles.note}>View the archival clipping · No political endorsement implied</p>
        </div>
      </div>
    </section>
  );
}
