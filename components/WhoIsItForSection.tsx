import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ChartNoAxesColumnIncreasing, GraduationCap, Heart, UsersRound } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import styles from "./WhoIsItForSection.module.css";

const audiences = [
  { title: "Students", description: "Clarity on strengths, studies, and future direction.", Icon: GraduationCap },
  { title: "Job Seekers", description: "Guidance on opportunities, timing, and career progress.", Icon: BriefcaseBusiness },
  { title: "Business Owners", description: "Support with decisions, stability, and growth.", Icon: ChartNoAxesColumnIncreasing },
  { title: "Couples", description: "Insight into compatibility, relationships, and marriage timing.", Icon: Heart },
  { title: "Parents", description: "Understanding a child’s strengths, future, and right path.", Icon: UsersRound },
];

export default function WhoIsItForSection({ checkoutHref }: { checkoutHref: string }) {
  return (
    <section className={styles.section} aria-labelledby="who-is-it-for-heading">
      <div className={styles.shell}>
        <div className={styles.visual}>
          <div className={styles.imageFrame}>
            <Image
              src="/surbhi-kundali-guidance.webp"
              alt="Surbhi Gupta preparing a personalized Kundali at her desk"
              width={924}
              height={1152}
              sizes="(max-width: 900px) 100vw, 45vw"
              loading="eager"
              unoptimized
              className={styles.image}
            />
          </div>
          <div className={styles.experience} aria-label="35 plus years mastering the stars">
            <span className={styles.experienceStar} aria-hidden="true">✦</span>
            <span><strong>35+ Years</strong><small>Mastering the Stars</small></span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.eyebrow}><SectionEyebrow>Guidance for Every Life Stage</SectionEyebrow></div>
          <h2 id="who-is-it-for-heading" className={`section-title ${styles.heading}`}>
            Who Should Get a <span>Premium Surbhi Kundali Report?</span>
          </h2>
          <p className={styles.intro}>
            If you feel stuck, uncertain, or need clarity about the right timing in life,
            a personalized Surbhi Kundali can help you make decisions with confidence.
          </p>

          <ol className={styles.list}>
            {audiences.map(({ title, description, Icon }, index) => (
              <li key={title}>
                <Link href={checkoutHref} className={styles.audience} aria-label={`${title}: ${description} Order your Surbhi Kundali`}>
                  <span className={styles.number}>{index + 1}</span>
                  <span className={styles.icon}><Icon size={27} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span className={styles.audienceText}><strong>{title}</strong><span>{description}</span></span>
                  <ArrowRight className={styles.chevron} size={21} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>

          <Link href={checkoutHref} className={`hero-cta-shimmer ${styles.cta}`}>
            <span>Order My Surbhi Kundali Now</span>
            <span className={styles.ctaIcon}><ArrowRight size={23} strokeWidth={1.8} aria-hidden="true" /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
