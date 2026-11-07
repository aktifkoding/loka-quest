"use client";

import { useEffect, useState } from "react";

/**
 * Deretan chip navigasi seksi dengan scrollspy: seksi aktif disorot
 * saat halaman digulir. Fallback tenang tanpa JS (tetap anchor link).
 */
export function SectionToc({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries.find((entry) => entry.isIntersecting);
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-96px 0px -66% 0px", threshold: 0 }
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Daftar isi"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? "true" : undefined}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-[background-color,border-color,color] duration-200 ease-out-expo ${
            active === section.id
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary/20 hover:text-foreground hover:shadow-card"
          }`}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
