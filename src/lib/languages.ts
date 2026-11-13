import type { Lang } from "./i18n/types";

export type LanguageCategory =
  | "sapaan"
  | "sehari_hari"
  | "ungkapan"
  | "budaya"
  | "alam"
  | "bilangan";

export type LanguageDifficulty = "beginner" | "intermediate" | "advanced";

export interface RegionalLanguage {
  id: string;
  slug: string;
  name: string;
  nativeName: string;
  regionSlug: string;
  regionName: string;
  scriptName?: string;
  description: string;
  /** Ringkasan dalam bahasa Inggris (opsional — untuk UI EN). */
  descriptionEn?: string;
  speakersEstimate: string;
  culturalNote: string;
  /** Catatan budaya dalam bahasa Inggris (opsional — untuk UI EN). */
  culturalNoteEn?: string;
  greeting: {
    word: string;
    phonetic: string;
    meaning: string;
    /** Arti sapaan dalam bahasa Inggris (opsional — untuk UI EN). */
    meaningEn?: string;
    audioUrl?: string;
  };
}

export interface VocabularyItem {
  id: string;
  languageSlug: string;
  word: string;
  phonetic: string;
  meaning: string;
  /** Arti dalam bahasa Inggris (opsional — diisi untuk UI EN). */
  meaningEn?: string;
  category: LanguageCategory;
  difficulty: LanguageDifficulty;
  exampleSentence: string;
  exampleMeaning: string;
  culturalContext?: string;
  relatedArticleSlug?: string;
  audioUrl?: string;
}

export interface LanguageQuizQuestion {
  id: string;
  wordId: string;
  languageSlug: string;
  languageName: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  phonetic: string;
  explanation: string;
}

export const REGIONAL_LANGUAGES: RegionalLanguage[] = [
  {
    id: "lang-jawa",
    slug: "jawa",
    name: "Bahasa Jawa",
    nativeName: "Basa Jawa (ꦧꦱꦗꦮ)",
    regionSlug: "jawa-tengah",
    regionName: "Jawa Tengah & DI Yogyakarta",
    scriptName: "Aksara Jawa (Hanacaraka)",
    description: "Bahasa Austronesia dengan sistem tingkatan tutur (ngoko, madya, krama) yang sarat tata krama dan filosofi luhur.",
    descriptionEn: "An Austronesian language with speech levels (ngoko, madya, krama) that are rich in courtesy and lofty philosophy.",
    speakersEstimate: "± 68 juta penutur",
    culturalNote: "Penggunaan tingkat tutur krama mencerminkan penghormatan mendalam antargenerasi.",
    culturalNoteEn: "The use of krama speech levels reflects deep respect across generations.",
    greeting: {
      word: "Sugeng Rawuh",
      phonetic: "/su.ɡəŋ ra.wʊh/",
      meaning: "Selamat Datang",
      meaningEn: "Welcome",
      audioUrl: "/assets/audio/jawa-sugeng-rawuh.mp3",
    },
  },
  {
    id: "lang-sunda",
    slug: "sunda",
    name: "Bahasa Sunda",
    nativeName: "Basa Sunda (ᮘᮞ ᮞᮥᮔ᮪ᮓ)",
    regionSlug: "jawa-barat",
    regionName: "Jawa Barat & Banten",
    scriptName: "Aksara Sunda Baku",
    description: "Bahasa yang terkenal halus dengan nilai 'Someah Hade ka Semah' (ramah pada tamu) dan dialek priangan yang kaya intonasi merdu.",
    descriptionEn: "A language renowned for its gentleness, the value of 'Someah Hade ka Semah' (kind to guests), and melodious Priangan dialects.",
    speakersEstimate: "± 42 juta penutur",
    culturalNote: "Intonasi meliuk dan vokal é khas membawa kehangatan tuturan masyarakat Parahyangan.",
    culturalNoteEn: "Its flowing intonation and distinctive é vowel carry the warmth of the Parahyangan people's speech.",
    greeting: {
      word: "Sampurasun",
      phonetic: "/sam.pu.ra.sun/",
      meaning: "Salam sejahtera / Mohon maaf lahir batin",
      meaningEn: "A greeting of well-being / asking forgiveness in body and soul",
      audioUrl: "/assets/audio/sunda-sampurasun.mp3",
    },
  },
  {
    id: "lang-minang",
    slug: "minang",
    name: "Bahasa Minangkabau",
    nativeName: "Baso Minang",
    regionSlug: "sumatera-barat",
    regionName: "Sumatera Barat",
    scriptName: "Huruf Latin & Jawi (Arab Melayu)",
    description: "Bahasa dinamis dengan kekayaan pantun, petatah-petitih adat, dan metafora cerdas yang diasah tradisi merantau.",
    descriptionEn: "A dynamic language rich in pantun verses, adat proverbs, and clever metaphors honed by the merantau (migration) tradition.",
    speakersEstimate: "± 5.5 juta penutur",
    culturalNote: "Pepatah Minang 'Alam takambang jadi guru' menjadi panduan tutur dan laku hidup.",
    culturalNoteEn: "The Minang proverb 'Alam takambang jadi guru' (nature unfurls to become the teacher) guides speech and daily conduct.",
    greeting: {
      word: "Salamaik Datang",
      phonetic: "/sa.la.maik da.taŋ/",
      meaning: "Selamat Datang",
      meaningEn: "Welcome",
      audioUrl: "/assets/audio/minang-salamaik.mp3",
    },
  },
  {
    id: "lang-bali",
    slug: "bali",
    name: "Bahasa Bali",
    nativeName: "Basan Bali (ᬩᬲᬩᬮᬶ)",
    regionSlug: "bali",
    regionName: "Pulau Bali & Lombok Barat",
    scriptName: "Aksara Bali",
    description: "Bahasa kaya estetika yang memadukan strata bahasa (Alus, Madia, Andap) dalam persembahyangan dan kesenian tradisi pura.",
    descriptionEn: "An aesthetic language that blends speech strata (Alus, Madia, Andap) in temple worship and traditional sacred arts.",
    speakersEstimate: "± 3.3 juta penutur",
    culturalNote: "Memiliki strata penghormatan yang mencerminkan harmoni Tri Hita Karana.",
    culturalNoteEn: "Its strata of respect reflect the harmony of Tri Hita Karana.",
    greeting: {
      word: "Om Swastiastu",
      phonetic: "/om swas.ti.as.tu/",
      meaning: "Semoga dalam keadaan selamat atas karunia Hyang Widhi",
      meaningEn: "May you be safe and blessed by the grace of Hyang Widhi",
      audioUrl: "/assets/audio/bali-swastiastu.mp3",
    },
  },
  {
    id: "lang-batak",
    slug: "batak-toba",
    name: "Bahasa Batak Toba",
    nativeName: "Hata Batak Toba (ᯂᯖ ᯅᯖᯂ᯲)",
    regionSlug: "sumatera-utara",
    regionName: "Sumatera Utara (Tanah Batak)",
    scriptName: "Surat Batak",
    description: "Bahasa dengan artikulasi tegas, ritmis, dan puitis dalam umpasa (pantun berkat adat Dalihan Na Tolu).",
    descriptionEn: "A language with firm, rhythmic, and poetic articulation in the umpasa (blessing verses) of the Dalihan Na Tolu adat.",
    speakersEstimate: "± 2 juta penutur",
    culturalNote: "Kata 'Horas' bukan sekadar sapaan, melainkan doa kesehatan, keteguhan, dan kebahagiaan.",
    culturalNoteEn: "The word 'Horas' is more than a greeting — it is a prayer for health, steadfastness, and happiness.",
    greeting: {
      word: "Horas Ma Di Hita Saluhutna",
      phonetic: "/ho.ras ma di hi.ta sa.lu.hut.na/",
      meaning: "Semoga berkah dan bahagia bagi kita sekalian",
      meaningEn: "May blessing and happiness be with us all",
      audioUrl: "/assets/audio/batak-horas.mp3",
    },
  },
  {
    id: "lang-bugis",
    slug: "bugis",
    name: "Bahasa Bugis",
    nativeName: "Basa Ugi (ᨅᨔ ᨕᨘᨁᨗ)",
    regionSlug: "sulawesi-selatan",
    regionName: "Sulawesi Selatan",
    scriptName: "Lontara Bugis",
    description: "Bahasa bahari dan falsafah 'Siri Na Pacce' (kehormatan dan solidaritas), yang mengabadikan epos agung I La Galigo.",
    descriptionEn: "A seafaring language and philosophy of 'Siri Na Pacce' (honor and solidarity) that preserves the great epic I La Galigo.",
    speakersEstimate: "± 5 juta penutur",
    culturalNote: "Ditururkan oleh para pelaut ulung pembangun kapal Pinisi melintasi samudra.",
    culturalNoteEn: "Spoken by master sailors who built Pinisi ships and crossed the oceans.",
    greeting: {
      word: "Aga Kareba",
      phonetic: "/a.ɡa ka.re.ba/",
      meaning: "Apa kabar?",
      meaningEn: "How are you?",
      audioUrl: "/assets/audio/bugis-aga-kareba.mp3",
    },
  },
  {
    id: "lang-papua",
    slug: "papua-asmat",
    name: "Bahasa Asmat & Melayu Papua",
    nativeName: "Basa Papua",
    regionSlug: "papua",
    regionName: "Papua Selatan & Pesisir",
    scriptName: "Alfabet Latin",
    description: "Representasi kekayaan linguistik Papua dengan keterikatan erat pada hutan, sungai, roh leluhur, dan tenun noken.",
    descriptionEn: "A representation of Papua's linguistic wealth, closely bound to the forest, rivers, ancestral spirits, and noken weaving.",
    speakersEstimate: "± 1.2 juta penutur lintas komunitas",
    culturalNote: "Simbol persaudaraan dan keakraban lewat sapaan hangat 'Kitorang basudara'.",
    culturalNoteEn: "A symbol of brotherhood and closeness through the warm greeting 'Kitorang basudara' (we are siblings).",
    greeting: {
      word: "Amolongo / Selamat Pagi Kaka",
      phonetic: "/a.mo.lo.ŋo/",
      meaning: "Salam damai dan salam persaudaraan",
      meaningEn: "A greeting of peace and brotherhood",
      audioUrl: "/assets/audio/papua-amolongo.mp3",
    },
  },
];

export const REGIONAL_VOCABULARIES: VocabularyItem[] = [
  // --- JAWA ---
  {
    id: "voc-jw-1",
    languageSlug: "jawa",
    word: "Matur Nuwun",
    phonetic: "/ma.tʊr nu.wʊn/",
    meaning: "Terima Kasih",
    meaningEn: "Thank you",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Matur nuwun sanget kagem sedaya pitulungan panjenengan.",
    exampleMeaning: "Terima kasih banyak atas segala pertolongan Anda.",
    relatedArticleSlug: "batik-indonesia",
  },
  {
    id: "voc-jw-2",
    languageSlug: "jawa",
    word: "Canting",
    phonetic: "/tʃan.tiŋ/",
    meaning: "Alat kecil dari tembaga dan kayu untuk menorehkan cairan malam lilin batik",
    meaningEn: "A small copper and wooden tool used to apply molten wax in batik making",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Ibu ngasta canting alus kanggo nggawe pola batik parang.",
    exampleMeaning: "Ibu memegang canting halus untuk membuat pola batik parang.",
    relatedArticleSlug: "batik-indonesia",
  },
  {
    id: "voc-jw-3",
    languageSlug: "jawa",
    word: "Kendhang",
    phonetic: "/kən.daŋ/",
    meaning: "Gendang berkepala ganda pemimpin irama dalam ansambel gamelan",
    meaningEn: "The double-headed drum that leads the rhythm in a gamelan ensemble",
    category: "budaya",
    difficulty: "intermediate",
    exampleSentence: "Tabuhan kendhang maringi aba-aba tempo suwuk marang niyaga liyane.",
    exampleMeaning: "Pukulan gendang memberi aba-aba tempo berakhir kepada para pemusik gamelan.",
    relatedArticleSlug: "gamelan-jawa",
  },
  {
    id: "voc-jw-4",
    languageSlug: "jawa",
    word: "Dalang",
    phonetic: "/da.laŋ/",
    meaning: "Pencerita utama dan penggerak wayang dalam pertunjukan wayang kulit",
    meaningEn: "The chief storyteller and puppeteer in a shadow puppet (wayang kulit) performance",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Ki Dalang nyritakake lakon Mahabharata kanthi suluk endah.",
    exampleMeaning: "Ki Dalang menceritakan lakon Mahabharata dengan lantunan tembang suluk yang indah.",
    relatedArticleSlug: "wayang-kulit",
  },
  {
    id: "voc-jw-5",
    languageSlug: "jawa",
    word: "Curiga / Dhuwung",
    phonetic: "/dʊ.wʊŋ/",
    meaning: "Sebutan krama kawi untuk Keris pusaka",
    meaningEn: "The refined (krama) name for the sacred keris dagger",
    category: "budaya",
    difficulty: "advanced",
    exampleSentence: "Dhuwung punika dados lambang kawicaksanan saha pasedherekan.",
    exampleMeaning: "Keris tersebut menjadi lambang kebijaksanaan dan persaudaraan.",
    relatedArticleSlug: "keris",
  },
  {
    id: "voc-jw-6",
    languageSlug: "jawa",
    word: "Empon-empon",
    phonetic: "/əm.pɔn əm.pɔn/",
    meaning: "Rimpang bahan dasar jamu tradisional (kunyit, temulawak, jahe)",
    meaningEn: "Rhizomes used as the base of traditional jamu herbal medicine (turmeric, temulawak, ginger)",
    category: "alam",
    difficulty: "intermediate",
    exampleSentence: "Empon-empon godhokan iki nyegerake raga nalika hawa adhem.",
    exampleMeaning: "Rebusan rimpang jamu ini menyegarkan tubuh ketika udara dingin.",
    relatedArticleSlug: "jamu",
  },

  // --- SUNDA ---
  {
    id: "voc-sd-1",
    languageSlug: "sunda",
    word: "Hatur Nuhun",
    phonetic: "/ha.tʊr nu.hʊn/",
    meaning: "Terima Kasih",
    meaningEn: "Thank you",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Hatur nuhun pisan parantos kersa sumping ka rorompok.",
    exampleMeaning: "Terima kasih banyak telah sudi berkunjung ke rumah sederhana kami.",
    relatedArticleSlug: "angklung",
  },
  {
    id: "voc-sd-2",
    languageSlug: "sunda",
    word: "Angklung",
    phonetic: "/aŋ.klʊŋ/",
    meaning: "Alat musik bambu multitonal yang dibunyikan dengan cara digoyangkan",
    meaningEn: "A multitonal bamboo instrument played by shaking",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Barudak sakola giat diajar maenkeun angklung lagu Sunda.",
    exampleMeaning: "Anak-anak sekolah giat belajar memainkan angklung lagu Sunda.",
    relatedArticleSlug: "angklung",
  },
  {
    id: "voc-sd-3",
    languageSlug: "sunda",
    word: "Gotong Royong / Sabilulungan",
    phonetic: "/sa.bi.lu.lu.ŋan/",
    meaning: "Kebersamaan dan kerja sama sehati demi kemaslahatan bersama",
    meaningEn: "Togetherness and wholehearted cooperation for the common good",
    category: "ungkapan",
    difficulty: "intermediate",
    exampleSentence: "Warga desa sauyunan sabilulungan ngabersihan solokan desa.",
    exampleMeaning: "Warga desa rukun dan kompak bekerja sama membersihkan saluran air desa.",
    relatedArticleSlug: "angklung",
  },
  {
    id: "voc-sd-4",
    languageSlug: "sunda",
    word: "Wilujeng Sumping",
    phonetic: "/wi.lu.dʒəŋ sum.piŋ/",
    meaning: "Selamat Datang",
    meaningEn: "Welcome",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Wilujeng sumping di tatar Pasundan anu asri.",
    exampleMeaning: "Selamat datang di tanah Pasundan yang permai.",
    relatedArticleSlug: "angklung",
  },

  // --- MINANGKABAU ---
  {
    id: "voc-mn-1",
    languageSlug: "minang",
    word: "Tarimo Kasih",
    phonetic: "/ta.ri.mo ka.sih/",
    meaning: "Terima Kasih",
    meaningEn: "Thank you",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Tarimo kasih banyak ateh sambutan nan sabana rancak.",
    exampleMeaning: "Terima kasih banyak atas sambutan yang sangat indah.",
    relatedArticleSlug: "randai",
  },
  {
    id: "voc-mn-2",
    languageSlug: "minang",
    word: "Randai",
    phonetic: "/ran.dai/",
    meaning: "Teater rakyat Minang memadukan silat, tarian gelombang, dendang, dan teater",
    meaningEn: "A Minang folk theatre blending silat, wave-like dance, singing, and drama",
    category: "budaya",
    difficulty: "intermediate",
    exampleSentence: "Tepukan galembong celana randai babunyi serempak di alek nagari.",
    exampleMeaning: "Tepukan celana galembong penari randai berbunyi serempak di pesta nagari.",
    relatedArticleSlug: "randai",
  },
  {
    id: "voc-mn-3",
    languageSlug: "minang",
    word: "Silek",
    phonetic: "/si.lɛk/",
    meaning: "Pencak silat tradisional khas Minangkabau untuk bela diri dan olah rasa",
    meaningEn: "The traditional Minangkabau martial art, practiced for self-defense and character building",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Silek Minang diajakan di sasaran surau untuak pandeka mudo.",
    exampleMeaning: "Silat Minang diajarkan di sasana surau untuk para pendekar muda.",
    relatedArticleSlug: "pencak-silat",
  },
  {
    id: "voc-mn-4",
    languageSlug: "minang",
    word: "Pantun Karmina",
    phonetic: "/pan.tun kar.mi.na/",
    meaning: "Pantun kilat dua seuntai pengantar nasehat cepat",
    meaningEn: "A quick two-line pantun couplet used to deliver concise advice",
    category: "budaya",
    difficulty: "intermediate",
    exampleSentence: "Urang tuo-tuo biaso balezat bapantun kutiko bamusyawarah.",
    exampleMeaning: "Para tetua adat terbiasa berbalas pantun ketika bermusyawarah.",
    relatedArticleSlug: "pantun",
  },

  // --- BALI ---
  {
    id: "voc-bl-1",
    languageSlug: "bali",
    word: "Matur Suksma",
    phonetic: "/ma.tʊr sʊk.sma/",
    meaning: "Terima Kasih",
    meaningEn: "Thank you",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Matur suksma ping banget antuk uratian ida dane sinamian.",
    exampleMeaning: "Terima kasih banyak atas perhatian hadirin sekalian.",
    relatedArticleSlug: "tari-kecak",
  },
  {
    id: "voc-bl-2",
    languageSlug: "bali",
    word: "Subak",
    phonetic: "/su.baʔ/",
    meaning: "Organisasi kemasyarakatan pengelola sistem irigasi persawahan Bali berbasis Tri Hita Karana",
    meaningEn: "The community organization managing Bali's rice terrace irrigation system, based on Tri Hita Karana",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Krama subak rembug ring pura ulun carik ngrembag pembagian toya.",
    exampleMeaning: "Warga subak bermusyawarah di pura sawah membahas pembagian aliran air.",
    relatedArticleSlug: "subak",
  },
  {
    id: "voc-bl-3",
    languageSlug: "bali",
    word: "Cak-cak-cak",
    phonetic: "/tʃak tʃak tʃak/",
    meaning: "Bunyi ritmis paduan suara vokal puluhan pria dalam tarian sakral Kecak",
    meaningEn: "The rhythmic chant of dozens of male voices in the sacred Kecak dance",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Gegendingan cak-cak-cak ngiring cerita Ramayana rikala surya engsep.",
    exampleMeaning: "Lantunan suara cak-cak-cak mengiringi kisah Ramayana saat matahari terbenam.",
    relatedArticleSlug: "tari-kecak",
  },

  // --- BATAK TOBA ---
  {
    id: "voc-bt-1",
    languageSlug: "batak-toba",
    word: "Horas",
    phonetic: "/hɔ.ras/",
    meaning: "Salam sukacita, keselamatan, dan kesejahteraan masyarakat Batak",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Horas ma di hita saluhutna na pungu di inganan on.",
    exampleMeaning: "Salam sejahtera bagi kita semua yang berkumpul di tempat ini.",
    relatedArticleSlug: "ulos",
  },
  {
    id: "voc-bt-2",
    languageSlug: "batak-toba",
    word: "Mauliate",
    phonetic: "/ma.u.li.a.tɛ/",
    meaning: "Terima Kasih",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Mauliate godang ma di hamu atas basa-basa muna.",
    exampleMeaning: "Terima kasih banyak kepada Anda atas kebaikan hati Anda.",
    relatedArticleSlug: "ulos",
  },
  {
    id: "voc-bt-3",
    languageSlug: "batak-toba",
    word: "Ulos",
    phonetic: "/u.lɔs/",
    meaning: "Kain tenun adat Batak bermakna pemberi kehangatan dan restu kehidupan",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Hula-hula mangulosi boruna tanda holong dohot pasu-pasu.",
    exampleMeaning: "Pihak pemberi gadis menyampirkan ulos kepada putrinya sebagai tanda kasih dan berkat.",
    relatedArticleSlug: "ulos",
  },
  {
    id: "voc-bt-4",
    languageSlug: "batak-toba",
    word: "Dalihan Na Tolu",
    phonetic: "/da.li.han na tɔ.lu/",
    meaning: "Falsafah tiga tungku kerabat adat Batak: Somba Marhula-hula, Manat Mardongan Tubu, Elek Marboru",
    category: "ungkapan",
    difficulty: "intermediate",
    exampleSentence: "Adat Batak jongjong di atas ni patik Dalihan Na Tolu.",
    exampleMeaning: "Adat Batak berdiri teguh di atas tatanan Dalihan Na Tolu.",
    relatedArticleSlug: "ulos",
  },

  // --- BUGIS ---
  {
    id: "voc-bg-1",
    languageSlug: "bugis",
    word: "Kurru Sumange",
    phonetic: "/kur.ru su.ma.ŋe/",
    meaning: "Terima Kasih / Semoga membangkitkan semangat hidup",
    meaningEn: "Thank you / May it lift your spirits",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Kurru sumange' atas bantuan ta' silessurengku.",
    exampleMeaning: "Terima kasih atas bantuanmu, saudaraku.",
    relatedArticleSlug: "pinisi",
  },
  {
    id: "voc-bg-2",
    languageSlug: "bugis",
    word: "Pinisi",
    phonetic: "/pi.ni.si/",
    meaning: "Kapal layar layar sekunar bertiang dua karya maestro perahu Tanah Beru Bulukumba",
    meaningEn: "A two-masted schooner sailing vessel crafted by the master boatbuilders of Tanah Beru, Bulukumba",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Panrita Lopi mappake pasang petuah napasialeng lopi Pinisi.",
    exampleMeaning: "Ahli perahu menerapkan petuah leluhur saat merakit kapal Pinisi.",
    relatedArticleSlug: "pinisi",
  },

  // --- PAPUA ---
  {
    id: "voc-pp-1",
    languageSlug: "papua-asmat",
    word: "Noken",
    phonetic: "/no.kɛn/",
    meaning: "Tas anyaman serat kulit kayu khas Papua yang dibawa menggantung di kening kepala",
    meaningEn: "A woven wood-bark bag from Papua, carried hanging from the forehead",
    category: "budaya",
    difficulty: "beginner",
    exampleSentence: "Mama merajut noken dari serat kayu melinjo sambil menjaga cucu di honai.",
    exampleMeaning: "Mama merajut noken dari serat kayu melinjo sambil menjaga cucu di honai.",
    relatedArticleSlug: "noken",
  },
  {
    id: "voc-pp-2",
    languageSlug: "papua-asmat",
    word: "Koyafa",
    phonetic: "/ko.ya.fa/",
    meaning: "Salam persahabatan dan kebersamaan di tanah Papua",
    meaningEn: "A greeting of friendship and togetherness in the land of Papua",
    category: "sapaan",
    difficulty: "beginner",
    exampleSentence: "Koyafa kaka, mari kitorang duduk cerita bersama.",
    exampleMeaning: "Salam sahabat kakak, mari kita duduk bercerita bersama.",
    relatedArticleSlug: "noken",
  },
];

/** Return all available regional languages */
export function getRegionalLanguages(): RegionalLanguage[] {
  return REGIONAL_LANGUAGES;
}

/** Return single language details by slug */
export function getLanguageBySlug(slug: string): RegionalLanguage | undefined {
  return REGIONAL_LANGUAGES.find((lang) => lang.slug === slug);
}

/** Return vocabularies for language with optional filtering */
export function getVocabulariesByLanguage(
  slug: string,
  options?: { category?: string; difficulty?: string }
): VocabularyItem[] {
  return REGIONAL_VOCABULARIES.filter((item) => {
    if (item.languageSlug !== slug) return false;
    if (options?.category && options.category !== "all" && item.category !== options.category) {
      return false;
    }
    if (options?.difficulty && options.difficulty !== "all" && item.difficulty !== options.difficulty) {
      return false;
    }
    return true;
  });
}

/** Return vocabularies linked to an encyclopedia article slug */
export function getVocabulariesForArticle(articleSlug: string): VocabularyItem[] {
  return REGIONAL_VOCABULARIES.filter((item) => item.relatedArticleSlug === articleSlug);
}

/** Return vocabularies linked to a region */
export function getVocabulariesForRegion(regionSlug: string): VocabularyItem[] {
  const languageSlugs = REGIONAL_LANGUAGES.filter(
    (lang) => lang.regionSlug === regionSlug
  ).map((lang) => lang.slug);

  return REGIONAL_VOCABULARIES.filter((item) => languageSlugs.includes(item.languageSlug));
}

/** Generate randomized quiz questions for a language */
export function generateLanguageQuiz(
  languageSlug: string,
  count = 5,
  lang: Lang = "id"
): LanguageQuizQuestion[] {
  const language = getLanguageBySlug(languageSlug);
  const items = REGIONAL_VOCABULARIES.filter((v) => v.languageSlug === languageSlug);
  if (!language || items.length === 0) return [];

  const shuffledItems = [...items].sort(() => Math.random() - 0.5).slice(0, count);

  return shuffledItems.map((item, index) => {
    // Collect 3 distractor meanings from other vocabularies
    const otherItems = REGIONAL_VOCABULARIES.filter((v) => v.id !== item.id);
    const distractors = otherItems
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((d) => d.meaning);

    const options = [item.meaning, ...distractors].sort(() => Math.random() - 0.5);

    const prompt =
      lang === "en"
        ? `What does "${item.word}" (${item.phonetic}) mean in ${language.name}?`
        : `Apa arti dari kata "${item.word}" (${item.phonetic}) dalam ${language.name}?`;
    const explanation =
      lang === "en"
        ? `"${item.word}" means ${item.meaningEn ?? item.meaning}. Example: ${item.exampleSentence} (${item.exampleMeaning})`
        : `"${item.word}" berarti ${item.meaning}. Contoh: ${item.exampleSentence} (${item.exampleMeaning})`;

    return {
      id: `quiz-${language.slug}-${index}-${item.id}`,
      wordId: item.id,
      languageSlug: language.slug,
      languageName: language.name,
      prompt,
      options,
      correctAnswer: item.meaning,
      phonetic: item.phonetic,
      explanation,
    };
  });
}
