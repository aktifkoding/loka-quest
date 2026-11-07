import { SiteFooter } from "@/components/layout/site-footer";

export default function EncyclopediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
