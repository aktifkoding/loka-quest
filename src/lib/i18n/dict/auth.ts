import type { Localized } from "../types";

/**
 * String UI untuk halaman auth: login, register, forgot-password,
 * update-password, dan callback. String halaman publik ada di dict/public.ts.
 */
export const authDict = {
  // Umum
  processing: { id: "Memproses…", en: "Processing…" },
  saving: { id: "Menyimpan…", en: "Saving…" },
  errorTryAgain: {
    id: "Terjadi kesalahan. Coba lagi.",
    en: "Something went wrong. Try again.",
  },
  placeholderEmail: { id: "nama@email.com", en: "name@email.com" },
  labelEmail: { id: "Email", en: "Email" },
  labelPassword: { id: "Kata sandi", en: "Password" },
  showPasswordAria: { id: "Tampilkan kata sandi", en: "Show password" },
  hidePasswordAria: { id: "Sembunyikan kata sandi", en: "Hide password" },
  signInCta: { id: "Masuk", en: "Sign in" },
  createAccountCta: { id: "Buat akun", en: "Create account" },

  // Login
  demoError: { id: "Gagal memulai demo", en: "Failed to start demo" },
  invalidCredentials: {
    id: "Email atau kata sandi tidak cocok.",
    en: "Email or password does not match.",
  },
  demoMissionName: { id: "Misi Batik Detective", en: "Batik Detective mission" },
  demoQuestion: {
    id: "Motif batik yang melambangkan keberanian adalah…",
    en: "The batik motif that symbolizes courage is…",
  },
  trustCopy: {
    id: "Progres pemain hanya bisa diakses pemiliknya. Data tersimpan aman di Supabase dengan proteksi tingkat baris.",
    en: "Player progress is accessible only to its owner. Data is stored securely in Supabase with row-level protection.",
  },
  loginHeading: { id: "Selamat datang kembali", en: "Welcome back" },
  loginSub: {
    id: "Masuk untuk melanjutkan petualangan budayamu.",
    en: "Sign in to continue your cultural adventure.",
  },
  forgotLink: { id: "Lupa kata sandi?", en: "Forgot password?" },
  loginPasswordPlaceholder: { id: "Kata sandi kamu", en: "Your password" },
  orDivider: { id: "atau", en: "or" },
  demoPreparing: {
    id: "Menyiapkan akun demo…",
    en: "Preparing demo account…",
  },
  demoCta: {
    id: "Coba demo instan — tanpa daftar",
    en: "Try instant demo — no sign-up",
  },
  noAccount: { id: "Baru di LokaQuest?", en: "New to LokaQuest?" },

  // Register
  ruleMinLength: { id: "Minimal 8 karakter", en: "At least 8 characters" },
  ruleUpperLower: {
    id: "Ada huruf besar dan kecil",
    en: "Has upper and lower case letters",
  },
  ruleDigit: { id: "Ada angka", en: "Has a number" },
  passwordNotMet: {
    id: "Kata sandi belum memenuhi syarat. Periksa petunjuk di bawah.",
    en: "The password does not meet the requirements yet. Check the hints below.",
  },
  emailAlreadyRegistered: {
    id: "Email ini sudah terdaftar. Coba masuk saja.",
    en: "This email is already registered. Try signing in instead.",
  },
  registerHeading: { id: "Buat akun LokaQuest", en: "Create a LokaQuest account" },
  registerSub: {
    id: "Satu menit untuk mulai misi pertamamu.",
    en: "One minute to start your first mission.",
  },
  labelFullName: { id: "Nama lengkap", en: "Full name" },
  placeholderFullName: {
    id: "Nama yang tampil di dasbor",
    en: "The name shown on your dashboard",
  },
  newPasswordPlaceholder: { id: "Buat kata sandi", en: "Create a password" },
  progressHeading: { id: "Level 1 menuju Level 2", en: "Level 1 towards Level 2" },
  xpProgress: { id: "240 dari 500 XP", en: "240 of 500 XP" },
  xpFromFirstMission: { id: "XP dari misi pertama", en: "XP from the first mission" },
  registerPrivacyCopy: {
    id: "Gratis untuk pelajar. Kami hanya menyimpan email dan nama tampilan — tanpa iklan, tanpa pelacakan iklan.",
    en: "Free for students. We only store your email and display name — no ads, no ad tracking.",
  },
  consentCopy: {
    id: "Dengan mendaftar, kamu setuju bahwa data progres belajarmu disimpan untuk pelaporan pembelajaran.",
    en: "By registering, you agree that your learning progress data is stored for learning reporting.",
  },
  haveAccount: { id: "Sudah punya akun?", en: "Already have an account?" },

  // Forgot password
  forgotHeading: { id: "Atur ulang kata sandi", en: "Reset your password" },
  forgotSub: {
    id: "Masukkan emailmu dan kami kirim tautan pengaturan ulang.",
    en: "Enter your email and we will send a reset link.",
  },
  sendLinkCta: { id: "Kirim tautan", en: "Send link" },
  resetSuccessHeading: { id: "Periksa kotak masukmu", en: "Check your inbox" },
  resetSuccessIfPrefix: { id: "Jika", en: "If" },
  resetSuccessRest: {
    id: "terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim. Tautan berlaku selama satu jam.",
    en: "is registered, a link to reset your password has been sent. The link is valid for one hour.",
  },
  backToLoginCta: {
    id: "Kembali ke halaman masuk",
    en: "Back to sign in",
  },
  rememberPassword: { id: "Ingat kata sandinya?", en: "Remember your password?" },

  // Update password
  ruleHasUpper: {
    id: "Mengandung huruf besar",
    en: "Contains an uppercase letter",
  },
  ruleHasLower: {
    id: "Mengandung huruf kecil",
    en: "Contains a lowercase letter",
  },
  ruleHasDigit: { id: "Mengandung angka", en: "Contains a number" },
  passwordNotAllMet: {
    id: "Kata sandi belum memenuhi semua syarat.",
    en: "The password does not meet all requirements yet.",
  },
  passwordMismatch: {
    id: "Konfirmasi kata sandi tidak sama.",
    en: "Password confirmation does not match.",
  },
  checkingLink: { id: "Memeriksa tautan…", en: "Checking the link…" },
  updateDoneHeading: { id: "Kata sandi diperbarui", en: "Password updated" },
  redirectingToDashboard: {
    id: "Mengalihkan ke dasbor…",
    en: "Redirecting to the dashboard…",
  },
  invalidLinkHeading: {
    id: "Tautan tidak valid atau kedaluwarsa",
    en: "Link invalid or expired",
  },
  invalidLinkDescription: {
    id: "Minta tautan baru untuk mengatur ulang kata sandi.",
    en: "Request a new link to reset your password.",
  },
  requestNewLinkCta: { id: "Minta tautan baru", en: "Request a new link" },
  newPassword: { id: "Kata sandi baru", en: "New password" },
  newPasswordSub: {
    id: "Masukkan kata sandi baru untuk akunmu.",
    en: "Enter a new password for your account.",
  },
  labelConfirmPassword: { id: "Ulangi kata sandi", en: "Repeat password" },
  savePasswordCta: { id: "Simpan kata sandi", en: "Save password" },

  // Callback
  preparingSession: { id: "Menyiapkan sesimu…", en: "Preparing your session…" },
  processingAuth: {
    id: "Memproses autentikasi",
    en: "Processing authentication",
  },
} satisfies Record<string, Localized>;
