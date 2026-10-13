import type { ReactNode } from "react";

type IconProps = { className?: string };

function IconCanvas({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function LifeBookIcon(props: IconProps) {
  return <IconCanvas {...props}>
    <path d="M7 24c8-3 16-2 25 3 9-5 17-6 25-3v27c-8-3-16-2-25 3-9-5-17-6-25-3V24Z" />
    <path d="M32 27v27M12 30c6-1 11 0 16 2M36 32c5-2 10-3 16-2M12 36c6-1 11 0 16 2M36 38c5-2 10-3 16-2" />
    <path d="M32 5v7M22 10l4 5M42 10l-4 5M18 19l6 2M46 19l-6 2" />
    <circle cx="32" cy="18" r="4" />
  </IconCanvas>;
}

export function ZodiacClockIcon(props: IconProps) {
  return <IconCanvas {...props}>
    <circle cx="32" cy="32" r="26" /><circle cx="32" cy="32" r="20" /><circle cx="32" cy="32" r="12" />
    <path d="M32 6v6M32 52v6M6 32h6M52 32h6M13.6 13.6l4.2 4.2M46.2 46.2l4.2 4.2M50.4 13.6l-4.2 4.2M17.8 46.2l-4.2 4.2" />
    <path d="M32 32V19M32 32l8 6" /><circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
    <path d="m32 14 1.5 2.5L32 19l-1.5-2.5L32 14ZM48 30l2 2-2 2-2-2 2-2Z" />
  </IconCanvas>;
}

export function GemstoneIcon(props: IconProps) {
  return <IconCanvas {...props}>
    <path d="M8 24h48l-7 12-17 20L15 36 8 24Z" />
    <path d="m8 24 10-12h28l10 12M18 12l8 12 6 32 6-32 8-12M8 24h48M26 24h12M15 36l11-12M49 36 38 24" />
    <path d="M32 3v5M29.5 5.5h5M54 7v5M51.5 9.5h5" />
  </IconCanvas>;
}

export function RemediesIcon(props: IconProps) {
  return <IconCanvas {...props}>
    <path d="M27 12c-2 5-1 8 5 12 6-4 7-7 5-12M32 9v15M21 18c4 1 7 3 11 6 4-3 7-5 11-6" />
    <path d="M21 27h22l-3 5c-2 2-3 5-3 8v7H27v-7c0-3-1-6-3-8l-3-5ZM24 32h16M22 47h20M18 52h28M23 56h18" />
    <circle cx="32" cy="39" r="4" /><path d="M28 39h8M32 35v8M13 31l4 1M51 31l-4 1M17 18l3 3M47 18l-3 3" />
  </IconCanvas>;
}

export function MarriageRingsIcon(props: IconProps) {
  return <IconCanvas {...props}>
    <circle cx="25" cy="35" r="15" /><circle cx="39" cy="35" r="15" />
    <path d="M17 23c3-2 5-3 8-3M47 47c-2 2-5 3-8 3M22 10l3 5 3-5-3-5-3 5ZM45 12l1.5 2.5L45 17l-1.5-2.5L45 12Z" />
    <path d="M9 8v5M6.5 10.5h5M55 52v5M52.5 54.5h5" />
  </IconCanvas>;
}

export function PlanetYogaIcon(props: IconProps) {
  return <IconCanvas {...props}>
    <circle cx="33" cy="32" r="13" /><ellipse cx="33" cy="32" rx="27" ry="9" transform="rotate(-26 33 32)" />
    <path d="M29 20c5-1 10 1 13 5M24 39c3 5 9 7 15 5M10 10v6M7 13h6M51 7v6M48 10h6M54 49v7M50.5 52.5h7" />
    <circle cx="16" cy="42" r="2" fill="currentColor" stroke="none" />
  </IconCanvas>;
}
