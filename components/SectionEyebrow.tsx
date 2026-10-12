import type { ReactNode } from "react";

export default function SectionEyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`inline-flex max-w-full items-center justify-center gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A3631D] sm:gap-3 sm:text-xs sm:tracking-[0.24em] ${className}`}>
      <span aria-hidden="true" className="h-px w-5 shrink-0 bg-[#C8A84B] sm:w-14" />
      <span aria-hidden="true" className="text-xl font-normal leading-none text-[#C8A84B]">✧</span>
      <span>{children}</span>
      <span aria-hidden="true" className="text-xl font-normal leading-none text-[#C8A84B]">✧</span>
      <span aria-hidden="true" className="h-px w-5 shrink-0 bg-[#C8A84B] sm:w-14" />
    </p>
  );
}
