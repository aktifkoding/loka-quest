import {
  CULTURAL_MEDIA_DATA,
  getCulturalMediaForArticle,
  getCulturalMediaForMission,
} from "@/lib/cultural-media";

const YT_ID_RE = /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}$/;
const COMMONS_RE = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[\w/()%0-9.~-]+\.(ogg|oga|mp3)$/;

describe("Cultural media data integrity", () => {
  it("has unique ids", () => {
    const ids = CULTURAL_MEDIA_DATA.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("renders videos as verified youtube-nocookie embed URLs (11-char id)", () => {
    for (const item of CULTURAL_MEDIA_DATA.filter((m) => m.mediaType === "video")) {
      expect(item.url).toMatch(YT_ID_RE);
    }
  });

  it("renders audio as direct upload.wikimedia.org file URLs", () => {
    for (const item of CULTURAL_MEDIA_DATA.filter((m) => m.mediaType === "audio")) {
      expect(item.url).toMatch(COMMONS_RE);
      expect(item.url).not.toContain(" ");
      expect(item.license).toBeTruthy();
      expect(item.attribution).toBeTruthy();
    }
  });

  it("every media item carries a non-empty creator", () => {
    for (const item of CULTURAL_MEDIA_DATA) {
      expect(item.creator?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("mission map resolves to article slugs that actually have media", () => {
    const withMedia = new Set(CULTURAL_MEDIA_DATA.map((m) => m.articleSlug));
    // cukup cek beberapa kunci yang memang sengaja dipetakan ke artikel ber-media
    for (const mission of ["batik-detective", "gamelan-maestro", "kolintang-musician", "sandeq-racer"]) {
      const media = getCulturalMediaForMission(mission);
      expect(media.length).toBeGreaterThan(0);
      for (const item of media) {
        expect(withMedia.has(item.articleSlug)).toBe(true);
      }
    }
  });

  it("missions without verified media return empty (no fabricated items)", () => {
    expect(getCulturalMediaForMission("lenggang-islands")).toHaveLength(0);
    expect(getCulturalMediaForMission("nonexistent-mission")).toHaveLength(0);
  });

  it("article lookup filters by slug", () => {
    const gamelan = getCulturalMediaForArticle("gamelan-jawa");
    expect(gamelan.length).toBe(3); // 2 audio + 1 video
    expect(gamelan.every((m) => m.articleSlug === "gamelan-jawa")).toBe(true);
  });
});
