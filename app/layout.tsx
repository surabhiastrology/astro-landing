import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Karla } from "next/font/google"; // CHANGED: Replaced existing fonts with Cormorant Garamond and Karla
import Script from "next/script";
import { META_PRODUCTION_HOSTNAME } from "@/lib/meta-checkout-events";
import "./globals.css";

// 1. Optimize Font Loading
// Set up both fonts as CSS variables to hook clean local system fallbacks
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1A0A00", 
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Celebrity Astrologer Surbhi Gupta - Personalized Astrology Reports",
  description: "Unveil the secrets of your future with Surbhi Gupta. Personalized astrology, career guidance, and love compatibility analysis.",
  alternates: {
    canonical: "https://surabhiastrology.com",
  },
};

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasLiveRazorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_live_") === true;

  return (
    // CHANGED: Linked the HTML tag to inject both variables into the layout tree
    <html lang="en" className={`${cormorantGaramond.variable} ${karla.variable}`}>
      <head>
        {/* GLOBAL GOOGLE TAG MANAGER (GTM) CODES */}
        {hasLiveRazorpayKey && <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            if (window.location.hostname === '${META_PRODUCTION_HOSTNAME}') {
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-N6XWPHSK');
            }
          `}
        </Script>}

        {/* OPTIMIZATION: FACEBOOK PIXEL */}
        {hasLiveRazorpayKey && <Script id="fb-pixel" strategy="afterInteractive">
          {`
            if (window.location.hostname === '${META_PRODUCTION_HOSTNAME}') {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              fbq('init', '1836254097051134');
              fbq('track', 'PageView');
            }
          `}
        </Script>}
      </head>
      {/* CHANGED: Configured the baseline body stack utilizing your precise font variables and cross-platform fallback priorities */}
      <body 
        className="antialiased" 
        style={{ fontFamily: `var(--font-sans), ui-sans-serif, system-ui, sans-serif` }}
      >
        {/* GTM FALLBACK LAYER FOR BROWSERS WITH RUNTIME JAVASCRIPT DISABLED */}
        {hasLiveRazorpayKey && process.env.VERCEL_ENV === "production" && <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-N6XWPHSK" 
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>}

        {children}

        <footer id="site-footer" className="border-t border-[#DCC9A8] bg-[#FFF9EF] px-5 py-5 text-center text-xs text-[#6B4423] sm:text-sm">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
            <span>© {new Date().getFullYear()} Surabhi Astrology. All rights reserved.</span>
            <span>
              Design and Promoted by{" "}
              <a
                href="https://synergyinfosoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline decoration-[#C8A77D] underline-offset-4 hover:text-[#8B1E1E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E]"
              >
                Synergy
              </a>
            </span>
          </div>
        </footer>

        {/* FACEBOOK PIXEL FALLBACK LAYER */}
        {hasLiveRazorpayKey && process.env.VERCEL_ENV === "production" && <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1836254097051134&ev=PageView&noscript=1"
            alt="pixel"
          />
        </noscript>}
      </body>
    </html>
  );
}
