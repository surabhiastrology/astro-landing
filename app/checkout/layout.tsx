import CheckoutProviders from "./providers";

export default function CheckoutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <CheckoutProviders>{children}</CheckoutProviders>;
}
