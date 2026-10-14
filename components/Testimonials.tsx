"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import SectionEyebrow from "./SectionEyebrow";

const reviews = [
  {
    src: "/customer-reviews/kundali-whatsapp-review-01.jpeg",
    alt: "WhatsApp message thanking Surbhi after receiving a Kundali report and voice note",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-02.jpeg",
    alt: "WhatsApp messages from a customer after receiving their Kundali report",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-03.jpeg",
    alt: "WhatsApp message thanking Surbhi after receiving a Kundali report and voice note",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-04.jpeg",
    alt: "WhatsApp message thanking Surbhi for sharing a Kundali report",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-05-redacted.jpeg",
    alt: "Customer WhatsApp conversation about a Surbhi Kundali report",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-06.jpeg",
    alt: "Customer WhatsApp conversation showing a Surbhi Kundali report and voice note",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-07.jpeg",
    alt: "Customer WhatsApp conversation after receiving a Surbhi Kundali report",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-08.jpeg",
    alt: "Customer WhatsApp conversation about a Surbhi Kundali report",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-09.jpeg",
    alt: "Customer WhatsApp conversation about a question answered after a Kundali report",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-10.jpeg",
    alt: "Customer WhatsApp conversation after receiving a Surbhi Kundali report",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-11.jpeg",
    alt: "Customer WhatsApp conversation showing a Surbhi Kundali report and voice note",
  },
  {
    src: "/customer-reviews/kundali-whatsapp-review-12.jpeg",
    alt: "Customer WhatsApp conversation about a Surbhi Kundali report",
  },
];

export default function TestimonialsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !carouselRef.current) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: carouselRef.current.scrollLeft,
      moved: false,
    };
  };

  const moveDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel || !dragRef.current.active) return;

    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 5) {
      dragRef.current.moved = true;
      setIsDragging(true);
      event.preventDefault();
    }
    if (dragRef.current.moved) {
      carousel.scrollLeft = dragRef.current.startScrollLeft - distance;
    }
  };

  const endDrag = () => {
    dragRef.current.active = false;
    setIsDragging(false);
  };

  const scrollByCard = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    const card = carousel?.firstElementChild as HTMLElement | null;
    if (!carousel || !card) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    carousel.scrollBy({ left: direction * (card.offsetWidth + 16), behavior: reducedMotion ? "instant" : "smooth" });
  };

  const updateActiveReview = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    setCanScrollBack(carousel.scrollLeft > 2);
    setCanScrollForward(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 2);

    const visibleLeft = carousel.getBoundingClientRect().left;
    const closest = Array.from(carousel.children).reduce(
      (current, child, index) => {
        const distance = Math.abs(child.getBoundingClientRect().left - visibleLeft);
        return distance < current.distance ? { index, distance } : current;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );
    setActiveIndex(closest.index);
  };

  return (
    <section aria-labelledby="customer-reviews-heading" className="bg-[#FCF7EE] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-5 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="text-center md:text-left">
            <SectionEyebrow className="mb-4">Customer Messages</SectionEyebrow>
            <h2 id="customer-reviews-heading" className="section-title text-[#2D1B11]">
              Their Words, <span className="text-[#A3631D]">Their Experience</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#6C5140] sm:text-base md:mx-0">
              A look at the messages customers sent after receiving their Surbhi Kundali reports.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollBack}
              aria-label="Previous customer message"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDBD82] bg-white text-[#8A1C21] transition-colors hover:bg-[#F7E9D0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollForward}
              aria-label="Next customer message"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDBD82] bg-white text-[#8A1C21] transition-colors hover:bg-[#F7E9D0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          onScroll={updateActiveReview}
          onMouseDown={startDrag}
          onMouseMove={moveDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onClickCapture={(event) => {
            if (dragRef.current.moved) {
              event.preventDefault();
              dragRef.current.moved = false;
            }
          }}
          role="region"
          aria-label="Customer WhatsApp messages"
          className={`flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 select-none cursor-grab [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragging ? "cursor-grabbing snap-none" : ""}`}
        >
          {reviews.map((review, index) => (
            <a
              key={review.src}
              href={review.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View customer WhatsApp message ${index + 1} full size`}
              className="group w-[min(78vw,310px)] shrink-0 snap-start overflow-hidden rounded-[18px] border border-[#E9D3AF] bg-white shadow-[0_12px_32px_rgba(72,42,15,0.10)] transition-shadow hover:shadow-[0_18px_42px_rgba(72,42,15,0.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A1C21] lg:w-[340px]"
            >
              <Image
                src={review.src}
                alt={review.alt}
                width={738}
                height={1600}
                draggable={false}
                sizes="(max-width: 640px) 78vw, 310px"
                className="h-auto w-full"
              />
            </a>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-center gap-4 md:hidden">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollBack}
            aria-label="Previous customer message"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDBD82] bg-white text-[#8A1C21] disabled:opacity-40"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <span className="min-w-14 text-center text-sm font-semibold tabular-nums text-[#6C5140]" aria-label={`Message ${activeIndex + 1} of ${reviews.length}`}>
            {activeIndex + 1} / {reviews.length}
          </span>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollForward}
            aria-label="Next customer message"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDBD82] bg-white text-[#8A1C21] disabled:opacity-40"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
