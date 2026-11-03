"use client";

import { useEffect } from "react";
import { captureOrderAttribution } from "@/lib/order-attribution-client";

export default function OrderAttributionCapture() {
  useEffect(() => {
    if (!window.location.pathname.startsWith("/admin")) captureOrderAttribution();
  }, []);
  return null;
}
