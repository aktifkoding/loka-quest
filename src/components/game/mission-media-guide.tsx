"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Film,
  Music,
  Headphones,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { shellDict as d } from "@/lib/i18n/dict/shell";
import { getCulturalMediaForMission } from "@/lib/cultural-media";

interface MissionMediaGuideProps {
  missionSlug: string;
}

export function MissionMediaGuide({
  missionSlug,
}: MissionMediaGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();
  const mediaItems = getCulturalMediaForMission(missionSlug);

  if (mediaItems.length === 0) return null;

  return (
    <Card className="overflow-hidden border-primary/25 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Headphones className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold">
                {t(d.mediaGuideBadge)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(d.mediaCount, { n: mediaItems.length })}
              </span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {t(d.mediaGuideSubtitle)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="gap-1.5 text-xs"
        >
          <span>{isExpanded ? t(d.mediaToggleClose) : t(d.mediaToggleOpen)}</span>
          {isExpanded ? (
            <ChevronUp className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-3.5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-5 space-y-4 border-t border-primary/15 pt-4 animate-fade-in">
          <p className="text-xs text-muted-foreground">
            {t(d.mediaGuideHelp)}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/80 bg-background/90 p-4 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  {item.mediaType === "audio" ? (
                    <Music className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <Film className="size-4 text-primary" aria-hidden="true" />
                  )}
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    {item.category === "musik"
                      ? t(d.mediaCategoryMusic)
                      : item.category === "tari"
                      ? t(d.mediaCategoryDance)
                      : t(d.mediaCategoryNarration)}
                  </p>
                </div>
                <h4 className="mt-1 font-display text-sm font-bold text-foreground">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-3">
                  {item.mediaType === "audio" ? (
                    <audio
                      controls
                      preload="none"
                      src={item.url}
                      className="w-full h-9"
                    >
                      {t(d.mediaAudioUnsupported)}
                    </audio>
                  ) : (
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <iframe
                        src={item.url}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {item.attribution && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {t(d.mediaSource, { source: item.attribution })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
