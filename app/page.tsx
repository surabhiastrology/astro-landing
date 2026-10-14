"use client";
import dynamic from "next/dynamic";

// Lazy load the heavy interactive components
import HowItWorksSection from "@/components/Simplesteps";
import SectionEyebrow from "@/components/SectionEyebrow";
import TrustSurbhiSection from "@/components/TrustSurbhiSection";
import WhoIsItForSection from "@/components/WhoIsItForSection";
import PremiumReportSection from "@/components/PremiumReportSection";
import WhatsInsideSection from "@/components/WhatsInsideSection";
import FeaturedPredictionSection from "@/components/FeaturedPredictionSection";
import KundaliFaqSection from "@/components/KundaliFaqSection";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FaWhatsapp } from "react-icons/fa6";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Coins,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  Pause,
  Play,
  ShieldCheck,
  Star,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
// import TestimonialsSection from "@/components/Testimonials";

// Load sections that are further down the page lazily
const TestimonialsSection = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="h-96 animate-pulse bg-ivory" />,
});

/* ─── PREMIUM COLOUR TOKENS ─── */
const C = {
  dk: "#1A0A00", // Deepest cosmic brown/black
  dk2: "#2A0E00", // Dark brown base
  dk3: "#3D1600",
  g: "#C8A84B", // Primary Gold
  g2: "#E2C06A", // Bright Gold
  g3: "#F5D98A",
  g4: "#FFF0C0",
  gg: "rgba(200,168,75,0.22)", // Highlight Gold
  heroBg: "#EFCF7A", // Warm golden yellow from inspiration
  heroBg2: "#DEB85D", // Deeper gold for gradient
  iv: "#FCF7EE", // Ivory/Cream background
  iv2: "#F4EAD6",
  iv3: "#E8D8B8",
  iv4: "#D8C49A",
  t1: "#2A1400", // Dark text
  t2: "#4A2E10", // Medium text
  red: "#8B1E1E", // Premium deep red
  grn: "#1B4D30", // Premium deep green
  td1: "#FCF7EE",
  td2: "rgba(252,247,238,0.80)",
  td3: "rgba(252,247,238,0.52)",
  td4: "rgba(252,247,238,0.30)",
};

const heroReportTopics = [
  { label: "Love & relationships", Icon: Heart },
  { label: "Marriage", Icon: Gift },
  { label: "Career growth", Icon: BriefcaseBusiness },
  { label: "Wealth & finance", Icon: Coins },
  { label: "Health", Icon: HeartPulse },
  { label: "Education", Icon: GraduationCap },
  { label: "Business", Icon: FileText },
];

const kundaliCheckoutHref =
  "/checkout?service=Surbhi%20Kundali&plan=10-Yr%20Report%20%2B%201Question%20(%E2%82%B9999)";

/* ─── GLOBAL KEYFRAME STYLES ─── */
const GlobalStyles = () => (
  <style>{`
    
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { 
      font-family: var(--font-outfit), sans-serif; 
      background: ${C.iv}; 
      color: ${C.t1}; 
      overflow-x: hidden; 
      -webkit-font-smoothing: antialiased; 
    }

    .Georgia { font-family: 'Georgia', serif; }
    
    /* Paper noise overlay for premium texture */
    body::before {
      content: ''; position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03; pointer-events: none; z-index: 9000;
    }

    /* Animations */
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
    @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spin-slow-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    @keyframes auto-shine { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }
    @keyframes hero-word-rise {
      0% { opacity: 0; transform: translateY(65%); }
      2.5%, 14.167% { opacity: 1; transform: translateY(0); }
      16.667%, 100% { opacity: 0; transform: translateY(-65%); }
    }

    .hero-rotating-word { display: inline-grid; overflow: hidden; vertical-align: baseline; white-space: nowrap; }
    .hero-rotating-word > span { grid-area: 1 / 1; opacity: 0; text-align: left; animation: hero-word-rise 18s ease-in-out infinite; }
    .hero-rotating-word > span:nth-child(2) { animation-delay: 3s; }
    .hero-rotating-word > span:nth-child(3) { animation-delay: 6s; }
    .hero-rotating-word > span:nth-child(4) { animation-delay: 9s; }
    .hero-rotating-word > span:nth-child(5) { animation-delay: 12s; }
    .hero-rotating-word > span:nth-child(6) { animation-delay: 15s; }
    @media (prefers-reduced-motion: reduce) {
      .hero-rotating-word > span { animation: none; }
      .hero-rotating-word > span:first-child { opacity: 1; }
    }

    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
    .animate-spin-slow { animation: spin-slow 40s linear infinite; }
    .animate-spin-reverse { animation: spin-slow-reverse 60s linear infinite; }

    /* Premium Button Shine */
    .btn-auto-shine { position: relative; overflow: hidden; }
    .btn-auto-shine::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.4) 50%, transparent 80%);
      animation: auto-shine 3s infinite linear;
    }

    /* Scroll Reveal Classes */
    .reveal { opacity: 0; transform: translateY(40px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .d1 { transition-delay: 0.1s; } .d2 { transition-delay: 0.2s; } .d3 { transition-delay: 0.3s; } .d4 { transition-delay: 0.4s; }

    /* Glassmorphism Cards */
    .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    
    /* Stepper Line */
    .timeline-line::before {
      content: ''; position: absolute; left: 24px; top: 0; bottom: 0; width: 2px;
      background: linear-gradient(to bottom, ${C.g}, transparent); z-index: 0;
    }
    @media (max-width: 768px) { .timeline-line::before { left: 16px; } }
    
    
  `}</style>
);

/* ─── COUNTDOWN ─── */
function useCountdown() {
  const [time, setTime] = useState({ h: 11, m: 47, s: 22 });
  useEffect(() => {
    const KEY = "sg_v5_next";
    let end = Number(localStorage.getItem(KEY));
    if (!end || end < Date.now()) {
      end = Date.now() + (11 * 3600 + 47 * 60 + 22) * 1000;
      localStorage.setItem(KEY, String(end));
    }
    const tick = () => {
      const d = Math.max(0, end - Date.now());
      setTime({
        h: Math.floor(d / 3600000),
        m: Math.floor((d % 3600000) / 60000),
        s: Math.floor((d % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ─── 3D COSMIC EARTH BACKGROUND ─── */

// Make sure to add the 'Georgia' font family in your tailwind config or global CSS.

// export default CelebrityEndorsementSection;

/* ─── REVEAL HOOK ─── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function NewLandingPage() {
  useReveal();
  const [stickyVisible, setStickyVisible] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const time = useCountdown();
  const playHeroVideo = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    void video
      .play()
      .then(() => setIsVideoPlaying(true))
      .catch(() => setIsVideoPlaying(false));
  };
  const toggleHeroVideo = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.paused) playHeroVideo();
    else video.pause();
  };
  const toggleHeroMute = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsVideoMuted(video.muted);
  };
  const playHeroMessage = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = false;
    setIsVideoMuted(false);
    playHeroVideo();
  };
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    void video
      .play()
      .then(() => setIsVideoPlaying(true))
      .catch(() => setIsVideoPlaying(false));
  }, []);
  useEffect(() => {
    const onScroll = () =>
      setStickyVisible(
        (heroSectionRef.current?.getBoundingClientRect().bottom ?? 600) < 0,
      );
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <GlobalStyles />

      {/* ── WA FLOAT ── */}
      <a
        href="https://wa.me/919251151330?text=Hi"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        aria-hidden={!stickyVisible}
        tabIndex={stickyVisible ? 0 : -1}
        style={{
          position: "fixed",
          right: 22,
          bottom: 88,
          zIndex: 199,
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          textDecoration: "none",
          opacity: stickyVisible ? 1 : 0,
          pointerEvents: stickyVisible ? "auto" : "none",
          transition: "opacity .2s ease",
        }}
      >
        <FaWhatsapp className="text-white w-8 h-8" />
      </a>

      {/* ════════════════════════════════
          ANNOUNCEMENT BAR — PREMIUM RED
      ════════════════════════════════ */}
      <div
        className="relative z-[100] flex flex-nowrap items-center justify-center gap-2 border-b px-3 py-2 text-center text-sm font-medium lg:py-2.5 lg:text-base"
        style={{
          background: C.red,
          borderColor: "rgba(255,255,255,.15)", // Subtle white border
          color: C.iv, // White/Cream text
          boxShadow: "0 2px 12px rgba(42,14,0,.16)",
        }}
      >
        <Gift
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#F5D98A] lg:h-5 lg:w-5"
          strokeWidth={1.8}
        />
        <span className="announcement-text-shimmer whitespace-nowrap lg:hidden">
          Premium Kundali ₹999 + FREE Question
        </span>
        <span className="announcement-text-shimmer hidden whitespace-nowrap lg:inline">
          Premium Surbhi Kundali — ₹999 | Includes 1 FREE WhatsApp question
        </span>
      </div>
      {/* ════════════════════════════════
          NAVBAR
      ════════════════════════════════ */}
      <nav
        className="sticky top-0 z-[99] flex h-20 items-center justify-between gap-3 border-b px-3 backdrop-blur-xl sm:h-24 sm:px-4 lg:px-8"
        style={{ background: "rgba(252,247,238,0.94)", borderColor: C.iv2 }}
      >
        <Link
          href="/"
          className="flex flex-shrink-0 items-center"
          aria-label="Surabhi Astrology home"
        >
          <Image
            src="/surbhi-astrology-logo.png"
            alt="Surabhi Astrology — Celebrity Astrologer Surbhi Gupta"
            width={280}
            height={94}
            sizes="(max-width: 640px) 195px, 270px"
            className="h-[clamp(3.5rem,16vw,4rem)] w-auto object-contain max-[359px]:h-[3.1rem] sm:h-[5.25rem]"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href={kundaliCheckoutHref}
            className="nav-cta-shimmer relative isolate inline-flex shrink-0 items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-[#DEB85D] to-[#EFCF7A] px-2.5 py-3.5 text-xs font-semibold text-[#2A0E00] shadow-md transition-transform hover:scale-[1.02] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#8B1E1E] sm:gap-2 sm:px-6 sm:text-sm"
          >
            <span className="relative z-10 whitespace-nowrap">
              Unlock My Kundli
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="relative z-10 h-4 w-4 shrink-0 sm:h-5 sm:w-5"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════
          KUNDALI HERO
      ════════════════════════════════ */}
      <section
        ref={heroSectionRef}
        className="relative isolate overflow-hidden bg-[#FCF7EE]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-cover bg-right lg:block"
          style={{
            backgroundImage:
              "url('/premium-astrology-hero-background-wide.png')",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-[#FCF7EE]/85 via-[#FCF7EE]/35 to-transparent lg:block"
        />
        <div className="relative mx-auto flex w-full max-w-[1560px] flex-col px-5 pb-8 pt-8 sm:px-8 lg:grid lg:min-h-[750px] lg:grid-cols-[minmax(0,1.07fr)_minmax(0,0.93fr)] lg:items-center lg:gap-0 lg:px-14 lg:py-8">
          <div className="relative z-20 max-w-[780px] text-center lg:text-left">
            <h1 className="font-serif text-[clamp(2.45rem,10vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.042em] text-[#111629] lg:text-[clamp(2.8rem,5.2vw,5.15rem)]">
              Discover What Your Kundali{" "}
              <span className="text-[#AB500F]">Reveals About</span>{" "}
              <span className="text-[#8B1E1E]">Your </span>
              <span
                className="hero-rotating-word text-[#8B1E1E]"
                aria-hidden="true"
              >
                <span>Life</span>
                <span>Career</span>
                <span>Love</span>
                <span>Wealth</span>
                <span>Marriage</span>
                <span>Future</span>
              </span>
              <span className="sr-only">
                Life, Career, Love, Wealth, Marriage, and Future
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-[650px] text-[1.02rem] leading-[1.5] text-[#33314B] sm:text-[1.15rem] lg:mx-0">
              <span className="lg:hidden">
                Get personalized kundali guidance by celebrity astrologer Surbhi
                Gupta.
              </span>
              <span className="hidden lg:inline">
                Get a personalized Kundali report created by celebrity
                astrologer Surbhi Gupta, with guidance for your birth chart,
                life questions, and next steps.
              </span>
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={kundaliCheckoutHref}
                className="hero-cta-shimmer relative inline-flex min-h-14 items-center justify-center gap-1 overflow-hidden rounded-full bg-[#8B1E1E] px-2.5 py-3.5 text-center text-base font-semibold text-white shadow-[0_12px_26px_rgba(91,20,20,0.22)] transition hover:bg-[#741919] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1E1E] sm:gap-2 sm:px-7 sm:text-lg"
              >
                <span className="relative z-10 whitespace-nowrap">
                  <span className="min-[360px]:hidden">
                    Get Surbhi Kundali ₹999
                  </span>
                  <span className="hidden min-[360px]:inline">
                    Get Premium Surbhi Kundali ₹999
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="relative z-10 h-5 w-5 shrink-0"
                  strokeWidth={1.8}
                />
              </a>
            </div>

            <div
              className="hero-topic-marquee mt-5 max-w-[690px] overflow-hidden"
              aria-label="Report topics"
            >
              <div className="hero-topic-track flex w-max">
                {[false, true].map((duplicate) => (
                  <div
                    key={String(duplicate)}
                    className="hero-topic-group flex shrink-0 gap-2 pr-2"
                    aria-hidden={duplicate || undefined}
                    role={duplicate ? undefined : "list"}
                  >
                    {heroReportTopics.map(({ label, Icon }) => (
                      <span
                        key={label}
                        role={duplicate ? undefined : "listitem"}
                        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#E8D8B8] bg-white/85 px-3 py-2 text-xs leading-tight text-[#2A1400] shadow-sm"
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-[#A3631D]"
                          strokeWidth={1.8}
                        />
                        {label}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 hidden max-w-[690px] items-center gap-3 rounded-[1.4rem] border-2 border-[#C8A84B] bg-[#FCF7EE]/90 px-3 py-3 shadow-[0_7px_28px_rgba(80,35,0,0.08)] lg:flex lg:px-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_3px_12px_rgba(37,211,102,0.24)]">
                <FaWhatsapp aria-hidden="true" className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold leading-tight text-[#8B1E1E] lg:text-xl">
                  Includes{" "}
                  <strong className="font-extrabold">
                    1 FREE WhatsApp Question
                  </strong>
                </p>
                <p className="mt-0.5 text-xs leading-snug text-[#4A2E10] sm:text-sm">
                  Personally answered by Surbhi Gupta via voice note after
                  reviewing your kundali.
                </p>
              </div>
              <button
                type="button"
                onClick={playHeroMessage}
                aria-label="Play Surbhi Gupta’s video message with sound"
                className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-white/80 py-1.5 pl-2 pr-1.5 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E] sm:flex"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B1E1E] text-white">
                  <Play
                    aria-hidden="true"
                    className="ml-0.5 h-4 w-4 fill-current"
                  />
                </span>
                <span aria-hidden="true" className="flex items-center gap-0.5">
                  {[8, 14, 21, 11, 24, 17, 9, 18, 12, 22, 10].map(
                    (height, index) => (
                      <span
                        key={index}
                        className="w-[2px] rounded-full bg-[#8B1E1E]"
                        style={{ height }}
                      />
                    ),
                  )}
                </span>
                <Image
                  src="/surbhi-gupta-new.JPG"
                  alt=""
                  width={38}
                  height={38}
                  className="ml-1 h-9 w-9 rounded-full object-cover object-[50%_28%]"
                />
              </button>
            </div>

            <div className="mt-5 hidden max-w-[760px] grid-cols-4 divide-x divide-[#D8C49A] border-t border-[#D8C49A] pt-4 lg:grid">
              <div className="flex min-w-0 items-center gap-2 pr-2 sm:pr-3">
                <Users
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 text-[#A3631D]"
                  strokeWidth={1.7}
                />
                <div>
                  <strong className="block text-sm leading-tight text-[#8B1E1E] sm:text-base">
                    1,50,000+
                  </strong>
                  <span className="mt-0.5 block text-[0.58rem] leading-tight text-[#4A2E10] sm:text-[0.67rem]">
                    Reports delivered
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2 px-2 sm:px-3">
                <Star
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 text-[#A3631D]"
                  strokeWidth={1.7}
                />
                <div>
                  <strong className="block text-sm leading-tight text-[#8B1E1E] sm:text-base">
                    4.9/5
                  </strong>
                  <span className="mt-0.5 block text-[0.58rem] leading-tight text-[#4A2E10] sm:text-[0.67rem]">
                    Average rating
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2 pr-2 sm:px-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 text-[#A3631D]"
                  strokeWidth={1.7}
                />
                <div>
                  <strong className="block text-sm leading-tight text-[#8B1E1E] sm:text-base">
                    Personally prepared
                  </strong>
                  <span className="mt-0.5 block text-[0.58rem] leading-tight text-[#4A2E10] sm:text-[0.67rem]">
                    By Surbhi Gupta
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2 pl-2 sm:pl-3">
                <FaWhatsapp
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 text-[#A3631D]"
                />
                <div>
                  <strong className="block text-sm leading-tight text-[#8B1E1E] sm:text-base">
                    Personal answer
                  </strong>
                  <span className="mt-0.5 block text-[0.58rem] leading-tight text-[#4A2E10] sm:text-[0.67rem]">
                    1 free WhatsApp question
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 -mx-5 mt-3 flex h-[590px] w-[calc(100%+2.5rem)] items-center justify-start bg-[url('/premium-astrology-hero-background-mobile.webp')] bg-cover bg-center pl-[12%] sm:-mx-8 sm:w-[calc(100%+4rem)] lg:mx-0 lg:mt-0 lg:h-full lg:w-auto lg:bg-none lg:pb-0 lg:pl-[14%] lg:pt-0">
            <div className="absolute right-2 top-[17%] z-20 flex items-center gap-2 rounded-2xl border border-[#E8D8B8] bg-white/95 px-2.5 py-2 shadow-[0_8px_20px_rgba(42,20,0,0.15)] lg:hidden xl:right-4 xl:top-[11%] xl:flex xl:px-4 xl:py-3">
              <Users
                aria-hidden="true"
                className="h-7 w-7 shrink-0 text-[#A3631D] lg:h-8 lg:w-8"
                strokeWidth={1.8}
              />
              <span className="text-[0.62rem] leading-tight text-[#2A1400] lg:text-xs">
                Trusted by
                <br />
                <strong className="text-sm leading-tight text-[#8B1E1E] lg:text-base">
                  1.5 Lakh+
                </strong>
                <br />
                Happy clients
              </span>
            </div>
            <div className="relative w-[min(59vw,265px)] rotate-[5deg] lg:w-[300px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 rounded-full bg-[#C8A84B]/20 blur-3xl"
              />
              <div className="relative aspect-[9/16.7] rounded-[3rem] border-[7px] border-[#49301A] bg-[#1A0A00] p-[5px] shadow-[18px_30px_42px_rgba(42,20,0,0.35)] ring-2 ring-[#CCA568]">
                <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-[#1A0A00]">
                  <video
                    ref={heroVideoRef}
                    autoPlay
                    muted={isVideoMuted}
                    loop
                    playsInline
                    disablePictureInPicture
                    onPlay={() => setIsVideoPlaying(true)}
                    onPlaying={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onVolumeChange={(event) =>
                      setIsVideoMuted(event.currentTarget.muted)
                    }
                    preload="metadata"
                    poster="/thumbnail.jpeg"
                    className="h-full w-full object-contain"
                    aria-label="Surbhi Gupta introduces the Premium Surbhi Kundali report"
                  >
                    <source
                      src="/videos/surbhi-gupta-premium-kundali-report-introduction.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support this video.
                  </video>
                  {!isVideoPlaying && (
                    <button
                      type="button"
                      onClick={playHeroVideo}
                      aria-label="Play Surbhi Gupta’s message"
                      className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-8px] focus-visible:outline-white"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white shadow-md backdrop-blur-sm"
                      >
                        <Play className="ml-1 h-7 w-7 fill-current" />
                      </span>
                    </button>
                  )}
                  <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={toggleHeroVideo}
                      aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white/85 backdrop-blur-sm transition hover:bg-black/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {isVideoPlaying ? (
                        <Pause
                          aria-hidden="true"
                          className="h-5 w-5 fill-current"
                        />
                      ) : (
                        <Play
                          aria-hidden="true"
                          className="ml-0.5 h-5 w-5 fill-current"
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={toggleHeroMute}
                      aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white/85 backdrop-blur-sm transition hover:bg-black/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {isVideoMuted ? (
                        <VolumeX aria-hidden="true" className="h-5 w-5" />
                      ) : (
                        <Volume2 aria-hidden="true" className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[10px] h-4 w-24 -translate-x-1/2 rounded-full bg-[#1A0A00]"
                />
              </div>
            </div>
          </div>
          <div className="relative z-20 -mt-8 flex items-center gap-2 rounded-[1.25rem] border-2 border-[#C8A84B] bg-[#FCF7EE]/95 px-2.5 py-3 shadow-[0_7px_28px_rgba(80,35,0,0.08)] lg:hidden">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
              <FaWhatsapp aria-hidden="true" className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-base font-semibold leading-tight text-[#8B1E1E]">
                Includes{" "}
                <strong className="font-extrabold">
                  1 FREE WhatsApp Question
                </strong>
              </p>
              <p className="mt-1 text-[0.66rem] leading-tight text-[#4A2E10]">
                Personally answered by Surbhi Gupta via voice note after
                reviewing your kundali.
              </p>
            </div>
            <button
              type="button"
              onClick={playHeroMessage}
              aria-label="Play Surbhi Gupta’s video message with sound"
              className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-white px-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B1E1E]"
            >
              <span aria-hidden="true" className="flex items-center gap-[1px]">
                {[8, 14, 19, 11, 21, 12, 7, 16].map((height, index) => (
                  <span
                    key={index}
                    className="w-[2px] rounded-full bg-[#8B1E1E]"
                    style={{ height }}
                  />
                ))}
              </span>
              <Image
                src="/surbhi-gupta-new.JPG"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover object-[50%_28%]"
              />
            </button>
          </div>
          <div className="relative z-20 mt-6 grid grid-cols-3 divide-x divide-[#D8C49A] lg:hidden">
            <div className="flex min-w-0 items-center gap-1 pr-1">
              <FileText
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[#A3631D]"
                strokeWidth={1.7}
              />
              <div>
                <strong className="block text-xs text-[#8B1E1E]">
                  1,50,000+
                </strong>
                <span className="block text-[0.55rem] leading-tight text-[#4A2E10]">
                  Reports delivered
                </span>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-1 px-1.5">
              <Star
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[#A3631D]"
                strokeWidth={1.7}
              />
              <div>
                <strong className="block text-xs text-[#8B1E1E]">4.9/5</strong>
                <span className="block text-[0.55rem] leading-tight text-[#4A2E10]">
                  Average rating
                </span>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-1 pl-1.5">
              <ShieldCheck
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[#A3631D]"
                strokeWidth={1.7}
              />
              <div>
                <strong className="block text-[0.68rem] leading-tight text-[#8B1E1E]">
                  Personally prepared
                </strong>
                <span className="block text-[0.55rem] leading-tight text-[#4A2E10]">
                  By Surbhi Gupta
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CELEBRITY TESTIMONIALS section to the second part after hero changes after client discussions */}

      <section className="relative overflow-hidden border-t border-[#E8D8B8] bg-gradient-to-b from-[#FCF7EE] to-[#F4EAD6] py-14 lg:py-20">
        {/* Global style injection for marquee sliding tracks */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
    .hide-scroll::-webkit-scrollbar { display: none; } 
    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes infinite-slide {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-infinite-slide {
      animation: infinite-slide 35s linear infinite;
    }
    .animate-infinite-slide:hover {
      animation-play-state: paused;
    }
    @media (prefers-reduced-motion: reduce) {
      .animate-infinite-slide { animation: none; }
      .proof-marquee { overflow-x: auto; mask-image: none !important; -webkit-mask-image: none !important; }
    }
  `,
          }}
        />

        {/* MAIN TEXT CONTAINER */}
        <div className="mx-auto mb-9 max-w-6xl px-5 text-center lg:mb-14">
          <SectionEyebrow className="mb-5">
            Celebrity Consultations
          </SectionEyebrow>

          <h2 className="section-title text-[#2A1400]">
            Trusted by <span className="text-[#8B1E1E]">1,50,000+</span>{" "}
            individuals for
            <span className="mt-2 block text-[#A3631D]">
              accurate Surbhi Kundali reports
            </span>
          </h2>
        </div>

        {/* CELEBRITY CAROUSEL (NOW AUTO-SCROLLING MARQUEE) */}
        <div className="relative mb-12 w-full lg:mb-16">
          {/* Continuous Sliding Track */}
          <div
            className="proof-marquee overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
            }}
          >
            <div className="flex w-max animate-infinite-slide gap-4 px-4 lg:gap-6">
              {[
                { name: "Leading Politician", img: "/celebs/4.jpeg" },
                { name: "Leading Politician", img: "/celebs/7.jpeg" },
                { name: "Top Industrialist", img: "/celebs/6.jpeg" },
                { name: "Cricket Icon", img: "/celebs/11.png" },
                { name: "Global CEO", img: "/celebs/8.jpg" },
                { name: "Global CEO", img: "/celebs/8.png" },
                { name: "Global CEO", img: "/celebs/9.jpeg" },
                { name: "Global CEO", img: "/celebs/9.png" },
                { name: "Global CEO", img: "/celebs/10.jpg" },
                { name: "Global CEO", img: "/celebs/13.jpeg" },
                { name: "Global CEO", img: "/celebs/14.jpeg" },
                { name: "Global CEO", img: "/celebs/1.jpeg" },
                { name: "Global CEO", img: "/celebs/2.jpeg" },
                { name: "Global CEO", img: "/celebs/3.jpeg" },
                // Duplicated items array for seamless looping matching layout execution
                { name: "Leading Politician", img: "/celebs/4.jpeg" },
                { name: "Leading Politician", img: "/celebs/7.jpeg" },
                { name: "Top Industrialist", img: "/celebs/6.jpeg" },
                { name: "Cricket Icon", img: "/celebs/11.png" },
                { name: "Global CEO", img: "/celebs/8.jpg" },
                { name: "Global CEO", img: "/celebs/8.png" },
                { name: "Global CEO", img: "/celebs/9.jpeg" },
                { name: "Global CEO", img: "/celebs/9.png" },
                { name: "Global CEO", img: "/celebs/10.jpg" },
                { name: "Global CEO", img: "/celebs/13.jpeg" },
                { name: "Global CEO", img: "/celebs/14.jpeg" },
                { name: "Global CEO", img: "/celebs/1.jpeg" },
                { name: "Global CEO", img: "/celebs/2.jpeg" },
                { name: "Global CEO", img: "/celebs/3.jpeg" },
              ].map((celeb, i) => (
                <div
                  key={i}
                  className="group relative aspect-[3/4] w-[140px] shrink-0 overflow-hidden rounded-2xl border border-[#D8C49A] bg-[#2A0E00] shadow-[0_12px_28px_rgba(61,22,0,0.14)] transition-transform duration-300 hover:-translate-y-1 sm:w-[180px] lg:w-[220px] lg:rounded-[24px]"
                >
                  <div className="absolute inset-0 bg-[#3D1600] flex items-center justify-center text-4xl opacity-20 z-0">
                    👤
                  </div>
                  <Image
                    src={celeb.img}
                    alt={celeb.name}
                    quality={50}
                    width={220}
                    height={293}
                    sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 220px"
                    className="absolute inset-0 z-0 h-full w-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                    priority={false}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-3 lg:p-5 z-20"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(20,5,0,0.95) 0%, rgba(20,5,0,0.6) 60%, transparent 100%)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRESS HEADER */}
        <div className="relative z-10 mx-auto mb-8 max-w-[1100px] px-5 text-center lg:mb-10 lg:px-7">
          <SectionEyebrow className="mb-5">As Featured In</SectionEyebrow>

          <h2 className="section-title text-[#2A1400]">
            Making headlines.
            <span className="mt-2 block text-[#A3631D]">
              Trusted by the press.
            </span>
          </h2>
        </div>

        <div
          className="proof-marquee w-full overflow-hidden pb-3 pt-2"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          }}
        >
          <div className="flex w-max animate-infinite-slide gap-4 lg:gap-6 px-4">
            {[
              {
                id: 2,
                publisher: "Hindustan Times",
                date: "Sep 2024",
                img: "/news/002.jpg",
              },
              {
                id: 3,
                publisher: "Mid-Day",
                date: "Aug 2024",
                img: "/news/003.jpg",
              },
              {
                id: 4,
                publisher: "Zee News",
                date: "Jul 2024",
                img: "/news/004.jpg",
              },
              {
                id: 6,
                publisher: "India Today",
                date: "May 2024",
                img: "/narendra-modi.jpg",
              },
              {
                id: 9,
                publisher: "Firstpost",
                date: "Feb 2024",
                img: "/news/009.png",
              },
              {
                id: 22,
                publisher: "Hindustan Times",
                date: "Sep 2024",
                img: "/news/002.jpg",
              },
              {
                id: 23,
                publisher: "Mid-Day",
                date: "Aug 2024",
                img: "/news/003.jpg",
              },
              {
                id: 24,
                publisher: "Zee News",
                date: "Jul 2024",
                img: "/news/004.jpg",
              },
              {
                id: 26,
                publisher: "India Today",
                date: "May 2024",
                img: "/narendra-modi.jpg",
              },
              {
                id: 29,
                publisher: "Firstpost",
                date: "Feb 2024",
                img: "/news/009.png",
              },
            ].map((news, i) => (
              <div
                key={news.id}
                className="group relative shrink-0 w-[260px] sm:w-[320px] lg:w-[380px] rounded-[18px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: C.dk,
                  border: "1px solid rgba(200,168,75,.15)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                <div className="relative w-full aspect-[4/3] bg-[#2A0E00] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10">
                    📰
                  </div>
                  <Image
                    src={news.img}
                    alt={`News snippet from ${news.publisher}`}
                    width={400}
                    height={300}
                    quality={50}
                    sizes="(max-width: 768px) 260px, (max-width: 1200px) 320px, 380px"
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 z-10"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/3 z-20"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(20,5,0,0.95) 0%, transparent 100%)",
                    }}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-30 flex items-end justify-between">
                  <div>
                    <div
                      className="text-[0.6rem] lg:text-[0.65rem] font-medium tracking-wider uppercase mb-1"
                      style={{ color: C.g }}
                    >
                      Media Coverage
                    </div>
                    <div className="Georgia text-[1.05rem] lg:text-[1.15rem] font-medium text-white leading-tight">
                      {news.publisher}
                    </div>
                  </div>
                  <div
                    className="text-[0.6rem] lg:text-[0.65rem] px-2 py-1 rounded border whitespace-nowrap"
                    style={{
                      color: C.td4,
                      borderColor: "rgba(255,255,255,0.15)",
                      background: "rgba(0,0,0,0.4)",
                    }}
                  >
                    {news.date}
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C8A84B]/40 rounded-[18px] transition-colors duration-300 z-40 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ════════════════════════════════
          LIFE AREAS — THE REPORT'S PRACTICAL GUIDANCE
      ════════════════════════════════ */}
      <section className="relative isolate overflow-hidden border-t border-[#E8D8B8]/70 bg-gradient-to-b from-[#FFFBF4] via-[#FCF7EE] to-[#F7EEDD] py-14 sm:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-center bg-no-repeat opacity-[0.08]"
          style={{
            backgroundImage: "url('/checkout-zodiac-wheels.png')",
            backgroundSize: "min(1500px, 100vw) auto",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1420px] px-5 sm:px-7 lg:px-10">
          <div className="mx-auto mb-9 max-w-4xl text-center sm:mb-11">
            <SectionEyebrow className="mb-5">
              Guidance for Every Part of Life
            </SectionEyebrow>
            <h2 className="section-title text-[#2A1400]">
              What Can Premium Surbhi Kundali{" "}
              <span className="block text-[#A3631D]">Help You With?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[690px] text-base leading-relaxed text-[#4A2E10] sm:text-lg">
              Discover what your birth chart reveals and receive practical
              guidance for the areas of life that matter most.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {[
              {
                title: "Love & Relationships",
                desc: "Understand your relationship patterns and gain clarity on timing and next steps.",
                img: "/section-guidance/love-relationships.webp",
                Icon: Heart,
                iconColor: "text-[#8B1E1E]",
                iconBg: "bg-[#F7E8E3]",
              },
              {
                title: "Career & Business Growth",
                desc: "Discover your strengths, right opportunities and the best time for growth.",
                img: "/section-guidance/career-business.webp",
                Icon: BriefcaseBusiness,
                iconColor: "text-[#A3631D]",
                iconBg: "bg-[#F8EAD4]",
              },
              {
                title: "Wealth & Financial Stability",
                desc: "Get insights on income, investments and long-term financial security.",
                img: "/section-guidance/wealth-finance.webp",
                Icon: Coins,
                iconColor: "text-[#6C7C4E]",
                iconBg: "bg-[#EFF2E4]",
              },
              {
                title: "Health & Well-being",
                desc: "Understand health tendencies and simple remedies for a more balanced life.",
                img: "/section-guidance/health-wellbeing.webp",
                Icon: HeartPulse,
                iconColor: "text-[#6C7C4E]",
                iconBg: "bg-[#EFF2E4]",
              },
              {
                title: "Marriage & Kundali Matchmaking",
                desc: "Check compatibility and gain clarity on delays, timing and a harmonious future.",
                img: "/section-guidance/marriage-matchmaking.webp",
                Icon: HeartHandshake,
                iconColor: "text-[#8B1E1E]",
                iconBg: "bg-[#F7E8E3]",
              },
              {
                title: "Child Future & Family Guidance",
                desc: "Explore your child's potential and get guidance for education, career and well-being.",
                img: "/section-guidance/child-family.webp",
                Icon: Users,
                iconColor: "text-[#84623F]",
                iconBg: "bg-[#F1EAF1]",
              },
            ].map(({ title, desc, img, Icon, iconColor, iconBg }) => (
              <Link
                key={title}
                href={kundaliCheckoutHref}
                className="group block overflow-hidden rounded-[24px] border border-[#E8D8B8] bg-[#FFFBF5] shadow-[0_14px_30px_rgba(74,46,16,0.09)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C8A84B] hover:shadow-[0_20px_38px_rgba(74,46,16,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1E1E]"
              >
                <div className="relative h-[260px] overflow-hidden sm:h-[285px] lg:h-[305px] xl:h-[325px]">
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) 50vw, 33vw"
                    quality={80}
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="relative -mt-5 min-h-[158px] rounded-t-[22px] bg-[#FFFBF5]/95 px-5 pb-6 pt-8 backdrop-blur-[4px] sm:px-6">
                  <span
                    aria-hidden="true"
                    className={`absolute -top-8 left-5 inline-flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#FFFBF5] shadow-sm ${iconBg} ${iconColor}`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.65} />
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-[1.7rem] font-medium leading-[1.05] tracking-[-0.02em] text-[#2A1400] sm:text-[1.8rem]">
                      {title}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8C49A] text-[#8B1E1E] transition-colors group-hover:bg-[#8B1E1E] group-hover:text-white"
                    >
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>
                  <p className="mt-2 max-w-[33ch] text-sm leading-[1.45] text-[#4A2E10] sm:text-[15px]">
                    {desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-11 flex flex-col items-center gap-3 text-center sm:mt-12">
            <Link
              href={kundaliCheckoutHref}
              className="hero-cta-shimmer relative inline-flex min-h-[60px] w-full max-w-[510px] items-center justify-center gap-4 overflow-hidden rounded-full border-2 border-[#C8A84B] bg-gradient-to-r from-[#6F1119] via-[#8B1E1E] to-[#6F1119] px-5 py-3 text-lg font-medium text-[#FCF7EE] shadow-[0_14px_28px_rgba(91,20,20,0.2)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1E1E] sm:px-8 sm:text-xl"
            >
              <span className="relative z-10">
                <span className="sm:hidden">Get My Surbhi Kundali</span>
                <span className="hidden sm:inline">
                  Get Your Premium Surbhi Kundali
                </span>
              </span>
              <span
                aria-hidden="true"
                className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFCF7A] text-[#4A2E10]"
              >
                <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
              </span>
            </Link>
            <p className="inline-flex items-center gap-2 text-sm text-[#4A2E10]">
              <FaWhatsapp
                aria-hidden="true"
                className="h-4 w-4 text-[#16843D]"
              />{" "}
              Includes 1 FREE WhatsApp Question
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          WHAT'S INSIDE (Premium Features Grid)
      ════════════════════════════════ */}
      <WhatsInsideSection />

      {/* FEATURED PREDICTION (Modi Section) */}
      <FeaturedPredictionSection />

      {/* ════════════════════════════════
        TESTIMONIALS (Real Transformations)
      ════════════════════════════════ */}
      <TestimonialsSection />

      {/* Premium report product and pricing */}
      <PremiumReportSection checkoutHref={kundaliCheckoutHref} />

      <HowItWorksSection />

      {/* Surbhi Gupta authority section */}
      <TrustSurbhiSection />
      <KundaliFaqSection />

      {/* ════════════════════════════════
          OFFER & CTA (Elegant Compact Design)
      ════════════════════════════════ */}
      <section id="offer" className="py-4 md:py-12 px-4 bg-[#FCF7EE]">
        <div className="max-w-[850px] mx-auto reveal">
          <div className="relative bg-gradient-to-br from-[#200404] via-[#3d0808] to-[#200404] rounded-3xl p-8 sm:p-12 shadow-[0_20px_40px_rgba(61,22,0,0.15)] overflow-hidden border-2 border-[#E8D8B8]">
            {/* Corner ribbon (Matching inspiration) */}
            <div className="absolute top-6 -right-10 bg-[#D9481E] text-white text-[10px] font-medium py-1.5 px-12 rotate-45 shadow-lg tracking-widest uppercase">
              OFFER
            </div>

            {/* Headers */}
            <div className="text-center mb-8">
              <div className="text-[#E8D8B8] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Premium Surbhi Kundali
              </div>
              <h2 className="section-title text-white">
                Your Complete Life Blueprint
              </h2>
            </div>

            {/* Two-Column Layout for Desktop (Compact!) */}
            <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
              {/* Left Column: Features */}
              <div className="space-y-4">
                {[
                  "10-Year Detailed Prediction Report",
                  "Complete Horoscope Analysis",
                  "Shani Sade Sati, Mangalik & Kaal Sarp Analysis",
                  "Personalized in depth Gemstone & Rudraksha Guide",
                  "Customized Vedic Remedies",
                  "Dasha & Life Cycle Analysis",
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-white/90 font-medium text-sm sm:text-base"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#E2C06A] text-[#2A0E00] flex items-center justify-center text-xs flex-shrink-0 shadow-md mt-0.5">
                      ✓
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Right Column: Pricing & CTA */}
              <div className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                {/* Price */}
                <div className="flex flex-col items-center mb-6">
                  <span className="text-white/50 line-through text-xl font-medium mb-1">
                    ₹2,999
                  </span>
                  <div className="flex items-start">
                    <span className="text-[#E2C06A] text-2xl font-medium mt-1 mr-1">
                      ₹
                    </span>
                    <span className="text-[#E2C06A] font-sans text-6xl font-medium leading-none tracking-tight">
                      999
                    </span>
                  </div>
                  <div className="bg-[#1B4D30]/80 border border-[#4ADE80]/30 text-[#A0F0C8] text-xs font-medium px-3 py-1 rounded-full mt-3">
                    You save ₹2,000 — Today Only!
                  </div>
                </div>

                {/* WhatsApp Bonus Box */}
                <div className="w-full bg-[#0D2614]/80 border border-[#1B4D30] rounded-xl p-3 mb-6 flex items-center justify-center gap-2 text-center">
                  <span className="text-xl shrink-0">💬</span>
                  <div className="text-[#4ADE80] font-medium text-xs sm:text-sm">
                    FREE: 1 Personal WhatsApp Q&A
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/checkout?service=Surbhi%20Kundali&plan=10-Yr%20Report%20%2B%201Question%20(%E2%82%B9999)"
                  className="btn-auto-shine block w-full bg-gradient-to-r from-[#D9481E] to-[#A32A0C] text-white py-4 rounded-xl font-medium text-center text-lg shadow-[0_10px_20px_rgba(217,72,30,0.3)] hover:-translate-y-0.5 transition-transform duration-300"
                >
                  BUY NOW →
                </Link>
              </div>
            </div>

            {/* Footer: Trust & Timer */}
            <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6 text-xs text-white/50 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#E2C06A]">🔒</span> Secure
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#E2C06A]">⏱</span> 48hr
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#4ADE80]">✅</span> Guarantee
                </span>
              </div>

              <div className="flex items-center gap-2 text-white/60 text-sm font-medium bg-black/20 px-4 py-2 rounded-full border border-white/5">
                <span>⏳ Expires in:</span>
                <div className="text-[#E2C06A] font-medium tracking-widest">
                  {String(time?.h || 23).padStart(2, "0")}:
                  {String(time?.m || 38).padStart(2, "0")}:
                  {String(time?.s || 5).padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          STICKY BOTTOM BAR
      ════════════════════════════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[200] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${stickyVisible ? "translate-y-0 opacity-100" : "translate-y-[calc(100%+80px)] opacity-0 pointer-events-none"}`}
        aria-hidden={!stickyVisible}
      >
        <div className="sticky-cta-bar">
          <div className="sticky-cta-inner">
            <div className="sticky-cta-book" aria-hidden="true">
              <Image
                src="/premium-surbhi-kundali-realistic-book.png"
                alt=""
                width={1254}
                height={1254}
                sizes="(max-width: 639px) 90px, (max-width: 1000px) 135px, 160px"
              />
            </div>
            <div className="sticky-cta-product">
              <p className="sticky-cta-title">Premium Surbhi Kundali Report</p>
              <p className="sticky-cta-bonus">
                <FaWhatsapp aria-hidden="true" />
                <span>+ 1 Free WhatsApp Question</span>
              </p>
            </div>
            <div
              className="sticky-cta-pricing"
              aria-label="₹999, reduced from ₹2,999. Save 67 percent."
            >
              <span className="sticky-cta-current">₹999</span>
              <del className="sticky-cta-original">₹2,999</del>
              <span className="sticky-cta-savings">Save 67%</span>
            </div>
            <a
              href={kundaliCheckoutHref}
              tabIndex={stickyVisible ? 0 : -1}
              className="sticky-cta-button btn-auto-shine"
            >
              <span>Get Now</span>
              <ArrowRight aria-hidden="true" size={21} strokeWidth={1.8} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
