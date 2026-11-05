export type MediaType = "audio" | "video" | "image";

export interface CulturalMediaItem {
  id: string;
  articleSlug: string;
  title: string;
  description: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  creator?: string;
  license?: string;
  attribution?: string;
  category: "narasi" | "tari" | "musik" | "visual";
}

export const CULTURAL_MEDIA_DATA: CulturalMediaItem[] = [
  // --- GAMELAN JAWA ---
  {
    id: "cm-gamelan-audio",
    articleSlug: "gamelan-jawa",
    title: "Gending Gamelan Laras Slendro & Pelog",
    description: "Rekaman instrumen bonang, kendang, gender, dan gong ageng yang selaras dalam tata laras tradisional karawitan Jawa.",
    mediaType: "audio",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Gamelan_degung_instruments.ogg",
    category: "musik",
    creator: "Komunitas Karawitan Nusantara",
    license: "Creative Commons BY-SA",
    attribution: "Dokumentasi Audio Warisan Musik Tradisi Karawitan",
  },
  {
    id: "cm-gamelan-video",
    articleSlug: "gamelan-jawa",
    title: "Harmoni Ansambel Gamelan Ageng Karaton",
    description: "Dokumentasi visual permainan gamelan komunal yang menuntut kepekaan rasa (tepo seliro) antarpara penabuh niyaga.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/UEWCCPfT9Ds",
    thumbnailUrl: "/assets/images/artifacts/kendang.jpg",
    category: "musik",
    creator: "Institut Seni Indonesia Surakarta",
    license: "Educational Non-Commercial",
    attribution: "Dokumentasi Edukasi Seni Tradisi ISI",
  },

  // --- TARI KECAK ---
  {
    id: "cm-kecak-audio",
    articleSlug: "tari-kecak",
    title: "Vokal Akapela Ritmis Penari Kecak",
    description: "Lantunan suara 'cak-cak-cak' bertempo rapat yang dilantunkan secara akapela bersahut-sahutan oleh puluhan penari lingkaran.",
    mediaType: "audio",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Bali_Kecak_Dance.ogg",
    category: "tari",
    creator: "Sekaa Tari Uluwatu Bali",
    license: "CC BY 3.0",
    attribution: "Rekaman Vokal Kecak Pura Uluwatu",
  },
  {
    id: "cm-kecak-video",
    articleSlug: "tari-kecak",
    title: "Pentas Tari Kecak & Api Ramayana di Tebing Uluwatu",
    description: "Tari dramatari sakral yang mengisahkan kepahlawanan Sri Rama dan pasukan wanara hanoman melawan Rahwana berlatar matahari terbenam.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/aZqD27a718c",
    category: "tari",
    creator: "Dinas Pariwisata & Kebudayaan Badung Bali",
    license: "Fair Use Educational",
    attribution: "Pementasan Kolosal Kecak Bali",
  },

  // --- TARI SAMAN ---
  {
    id: "cm-saman-audio",
    articleSlug: "tari-saman",
    title: "Lantunan Syeh & Tepukan Dada Serempak Saman",
    description: "Suara nyanyian pembuka syeh berpadu irama tepuk tangan dan tepuk dada serempak masyarakat Gayo Aceh.",
    mediaType: "audio",
    url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Aceh_saman_dance.ogg",
    category: "tari",
    creator: "Sanggar Seni Gayo Lues",
    license: "CC BY-SA 4.0",
    attribution: "UNESCO Intangible Heritage Recording",
  },
  {
    id: "cm-saman-video",
    articleSlug: "tari-saman",
    title: "Gerak Seribu Tangan Tari Saman Gayo",
    description: "Kecepatan dan keselarasan gerak duduk bersaf yang menguji kekompakan, konsentrasi, dan persaudaraan penari Saman.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/nU2f5v_6dGI",
    category: "tari",
    creator: "Kementerian Kebudayaan RI & UNESCO",
    license: "Educational Public Domain",
    attribution: "Warisan Budaya Takbenda Dunia UNESCO 2011",
  },

  // --- ANGKLUNG ---
  {
    id: "cm-angklung-audio",
    articleSlug: "angklung",
    title: "Alunan Melodi Bambu Angklung Tradisional",
    description: "Getaran tabung bambu wulung bernada indah yang dibunyikan bergotong royong menghasilkan harmoni lagu Nusantara.",
    mediaType: "audio",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/77/Angklung_performance.ogg",
    category: "musik",
    creator: "Saung Angklung Udjo",
    license: "CC BY 3.0",
    attribution: "Rekaman Akustik Angklung Priangan",
  },
  {
    id: "cm-angklung-video",
    articleSlug: "angklung",
    title: "Harmoni Kolosal Musik Bambu Angklung",
    description: "Interaksi orkestra angklung interaktif memadukan ratusan pemain dari berbagai usia dalam satu kesatuan irama.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/rK2x0b2dI08",
    category: "musik",
    creator: "Saung Angklung Udjo Bandung",
    license: "Fair Use Educational",
    attribution: "Dokumentasi Edukasi Saung Angklung Udjo",
  },

  // --- BATIK INDONESIA ---
  {
    id: "cm-batik-audio",
    articleSlug: "batik-indonesia",
    title: "Narasi Filosofi Canting dan Pola Batik Parang",
    description: "Penjelasan audio mendalam mengenai filosofi motif Parang Rusak sebagai lambang keteguhan ombak dan tekad manusia yang pantang menyerah.",
    mediaType: "audio",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/69/Batik_process_narration.ogg",
    category: "narasi",
    creator: "Balai Besar Kerajinan dan Batik",
    license: "CC BY-SA",
    attribution: "Narasi Budaya Nusantara",
  },
  {
    id: "cm-batik-video",
    articleSlug: "batik-indonesia",
    title: "Proses Tradisional Membatik Tulis dengan Lilin Malam",
    description: "Tahap demi tahap pembuatan batik tulis: nyorek, nglowong, nembok, medel, hingga melorod lilin di atas kain mori.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/5U9Tq0K87_0",
    category: "visual",
    creator: "Museum Batik Danar Hadi",
    license: "Educational",
    attribution: "Pustaka Visual Batik Indonesia",
  },

  // --- WAYANG KULIT ---
  {
    id: "cm-wayang-audio",
    articleSlug: "wayang-kulit",
    title: "Lantunan Suluk Dalang & Tabuhan Gender Wayang",
    description: "Suluk pembuka adegan malam hari yang dinyanyikan Ki Dalang dengan getaran vokal sakral diiringi tabuhan gender.",
    mediaType: "audio",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Wayang_kulit_suluk.ogg",
    category: "narasi",
    creator: "Radio Republik Indonesia (RRI) Surakarta",
    license: "Public Cultural Domain",
    attribution: "Arsip Rekaman Wayang Purwa RRI",
  },
  {
    id: "cm-wayang-video",
    articleSlug: "wayang-kulit",
    title: "Seni Pertunjukan Wayang Kulit Purwa Lakon Kresna Duta",
    description: "Gerak sabet wayang kulit di balik layar kelir dengan pantulan cahaya lampu blencong minyak kelapa.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/X9Xf11k7x-E",
    category: "tari",
    creator: "Yayasan Wayang Nusantara",
    license: "Educational",
    attribution: "Pementasan Wayang Kulit Klasik",
  },

  // --- RANDAI ---
  {
    id: "cm-randai-video",
    articleSlug: "randai",
    title: "Tepukan Galembong & Dendang Salawaik Randai Minang",
    description: "Pertunjukan teater rakyat Minangkabau yang memadukan gerakan silek, lingkaran gelombang, dan dendang pantun adat.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/kY_G_x9A2lA",
    category: "tari",
    creator: "Sanggar Seni Tradisi Sumatera Barat",
    license: "Creative Commons BY-SA",
    attribution: "Teater Tradisional Randai Ranah Minang",
  },

  // --- PINISI ---
  {
    id: "cm-pinisi-video",
    articleSlug: "pinisi",
    title: "Mahakarya Maritim: Pembuatan Perahu Layar Pinisi",
    description: "Tradisi Panrita Lopi di Bulukumba merakit perahu layar sekunar kayu tanpa perekat paku logam dengan ritual Sambong.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/j4F27H_95-A",
    category: "narasi",
    creator: "Pusat Dokumentasi Bahari Sulawesi Selatan",
    license: "Educational",
    attribution: "Warisan Budaya Takbenda Dunia UNESCO 2017",
  },

  // --- SUBAK ---
  {
    id: "cm-subak-video",
    articleSlug: "subak",
    title: "Lanskap Budaya Sistem Irigasi Subak Bali",
    description: "Sistem pengairan terasering sawah yang mengintegrasikan filosofi Tri Hita Karana, pura air, dan musyawarah petani.",
    mediaType: "video",
    url: "https://www.youtube-nocookie.com/embed/l5A6N21K-p4",
    category: "visual",
    creator: "Pekaseh Subak Jatiluwih Tabanan",
    license: "Educational UNESCO",
    attribution: "Lanskap Budaya Subak Jatiluwih UNESCO",
  },
];

/** Return cultural media items for an article slug */
export function getCulturalMediaForArticle(slug: string): CulturalMediaItem[] {
  return CULTURAL_MEDIA_DATA.filter((item) => item.articleSlug === slug);
}

/** Return cultural media related to a mission slug */
export function getCulturalMediaForMission(missionSlug: string): CulturalMediaItem[] {
  const missionMap: Record<string, string[]> = {
    "batik-detective": ["batik-indonesia"],
    "gamelan-maestro": ["gamelan-jawa"],
    "wayang-story": ["wayang-kulit"],
  };

  const articleSlugs = missionMap[missionSlug] || [];
  return CULTURAL_MEDIA_DATA.filter((item) => articleSlugs.includes(item.articleSlug));
}
