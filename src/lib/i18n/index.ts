// Barrel ini AMAN untuk client components — jangan re-export "./server"
// di sini (menarik next/headers ke bundle client). Konsumen server-side
// mengimpor langsung dari "@/lib/i18n/server".
export * from "./types";
export * from "./format";
export * from "./client";
