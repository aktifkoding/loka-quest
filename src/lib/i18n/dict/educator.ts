import type { Localized } from "../types";

/**
 * String UI untuk area pendidik: dasbor, kelompok belajar, kuis live,
 * dan analisis pembelajaran.
 */
export const educatorDict = {
  // Dasbor pendidik
  dashboardMetaTitle: { id: "Dasbor Pendidik", en: "Educator Dashboard" },
  dashboardTitle: { id: "Dasbor pendidik", en: "Educator dashboard" },
  dashboardDescription: {
    id: "Pantau progres kelompok siswa dan hasil asesmen pembelajaran.",
    en: "Track your student groups' progress and learning assessment results.",
  },
  manageGroupsCta: { id: "Kelola kelompok", en: "Manage groups" },
  liveQuizCta: { id: "Kuis live", en: "Live quiz" },
  metricActiveGroups: { id: "Kelompok aktif", en: "Active groups" },
  metricActiveGroupsNote: {
    id: "kelompok yang Anda kelola",
    en: "groups you manage",
  },
  metricTotalStudents: { id: "Total siswa", en: "Total students" },
  metricTotalStudentsNote: {
    id: "tergabung di semua kelompok",
    en: "enrolled across all groups",
  },
  metricAvailableMissions: { id: "Misi tersedia", en: "Available missions" },
  metricAvailableMissionsNote: {
    id: "misi budaya yang bisa ditugaskan",
    en: "cultural missions you can assign",
  },
  myGroupsHeading: { id: "Kelompok saya", en: "My groups" },
  emptyGroupsTitle: { id: "Belum ada kelompok", en: "No groups yet" },
  emptyGroupsDescription: {
    id: "Buat kelompok pertama — misalnya “Kelas 8A” — lalu bagikan kode gabung ke siswa.",
    en: "Create your first group — for example “Class 8A” — then share the join code with students.",
  },
  createFirstGroupCta: {
    id: "Buat kelompok pertama",
    en: "Create your first group",
  },
  analyticsCardHeading: {
    id: "Analisis pembelajaran",
    en: "Learning analytics",
  },
  analyticsCardDescription: {
    id: "Bandingkan hasil pre-test dan post-test untuk melihat perubahan pemahaman siswa. Laporan menyertakan jumlah sampel dan keterbatasannya.",
    en: "Compare pre-test and post-test results to see how student understanding changes. Reports include sample sizes and their limitations.",
  },
  openAnalyticsCta: { id: "Buka analisis", en: "Open analytics" },
  stepsHeading: {
    id: "Mulai dalam tiga langkah",
    en: "Get started in three steps",
  },
  stepN: { id: "Langkah {n}", en: "Step {n}" },
  stepCreateGroupTitle: {
    id: "Buat kelompok kelas",
    en: "Create a class group",
  },
  stepCreateGroupDescription: {
    id: "Satu kelompok per kelas atau klub budaya.",
    en: "One group per class or culture club.",
  },
  stepAssignTitle: {
    id: "Tugaskan misi & kuis",
    en: "Assign missions & quizzes",
  },
  stepAssignDescription: {
    id: "Siswa bergabung dengan kode kelompok, lalu mengerjakan misi budaya.",
    en: "Students join with the group code, then work through cultural missions.",
  },
  stepMonitorTitle: {
    id: "Pantau perkembangan",
    en: "Monitor progress",
  },
  stepMonitorDescription: {
    id: "Bandingkan pre-test dan post-test di analisis pembelajaran.",
    en: "Compare pre-test and post-test in learning analytics.",
  },

  // Halaman kelompok belajar
  backToDashboard: { id: "Dasbor pendidik", en: "Educator dashboard" },
  groupsTitle: { id: "Kelompok belajar", en: "Study groups" },
  groupsDescription: {
    id: "Buat kelas, bagikan kode join, dan beri tugas misi.",
    en: "Create classes, share join codes, and assign missions.",
  },
  newGroupNameLabel: { id: "Nama kelompok baru", en: "New group name" },
  newGroupNamePlaceholder: {
    id: "Kelas 8A — Budaya Nusantara",
    en: "Class 8A — Archipelago Culture",
  },
  createGroupCta: { id: "Buat kelompok", en: "Create group" },
  groupsLoadFailed: { id: "Gagal memuat kelompok", en: "Failed to load groups" },
  createGroupFailed: { id: "Gagal membuat kelompok", en: "Failed to create group" },
  groupCreatedToast: {
    id: "Kelompok dibuat. Bagikan kode join ke siswa.",
    en: "Group created. Share the join code with your students.",
  },
  assignFailed: { id: "Gagal memberi tugas", en: "Failed to assign" },
  assignmentAddedToast: { id: "Tugas ditambahkan.", en: "Assignment added." },
  joinCodeCopiedToast: { id: "Kode join disalin.", en: "Join code copied." },
  emptyGroups: { id: "Belum ada kelompok.", en: "No groups yet." },
  selectGroupHint: {
    id: "Pilih kelompok untuk melihat detail.",
    en: "Select a group to see its details.",
  },
  studentsCount: { id: "{n} siswa", en: "{n} students" },
  studentsJoined: { id: "{n} siswa bergabung", en: "{n} students joined" },
  assignHeading: { id: "Beri tugas", en: "Assign a mission" },
  missionLabel: { id: "Misi", en: "Mission" },
  missionPlaceholder: { id: "Pilih misi", en: "Choose a mission" },
  dueDateLabel: { id: "Tenggat (opsional)", en: "Due date (optional)" },
  assignCta: { id: "Tugaskan", en: "Assign" },
  emptyAssignments: { id: "Belum ada tugas.", en: "No assignments yet." },
  missionFallback: { id: "Misi", en: "Mission" },
  dueBy: { id: "Tenggat {date}", en: "Due {date}" },
  noDueDate: { id: "Tanpa tenggat", en: "No due date" },
  studentsHeading: { id: "Siswa ({n})", en: "Students ({n})" },
  shareJoinCodeHint: {
    id: "Bagikan kode join agar siswa dapat bergabung.",
    en: "Share the join code so students can join.",
  },
  studentFallback: { id: "Siswa", en: "Student" },
  levelXp: { id: "Level {level} · {xp} XP", en: "Level {level} · {xp} XP" },

  // Buat kuis live
  quizCreateTitle: { id: "Kuis kelas live", en: "Live class quiz" },
  quizCreateDescription: {
    id: "Buat sesi, bagikan kode, dan mainkan bersama siswa.",
    en: "Create a session, share the code, and play with your students.",
  },
  loadMissionsFailed: { id: "Gagal memuat misi", en: "Failed to load missions" },
  createQuizFailed: { id: "Gagal membuat kuis", en: "Failed to create quiz" },
  creating: { id: "Membuat…", en: "Creating…" },
  createQuizSessionCta: { id: "Buat sesi kuis", en: "Create quiz session" },
  sessionCodeLabel: { id: "Kode sesi", en: "Session code" },
  hostRoomCta: { id: "Buka ruang host", en: "Open host room" },
  playerScreenCta: { id: "Buka layar peserta", en: "Open player screen" },

  // Ruang host kuis
  backToClassQuiz: { id: "Kuis kelas", en: "Class quiz" },
  loadSessionFailed: { id: "Gagal memuat sesi", en: "Failed to load session" },
  actionFailed: { id: "Aksi gagal", en: "Action failed" },
  loadingSession: { id: "Memuat sesi…", en: "Loading session…" },
  questionCount: { id: "{n} soal", en: "{n} questions" },
  startCta: { id: "Mulai", en: "Start" },
  nextQuestionCta: { id: "Soal berikutnya", en: "Next question" },
  finishCta: { id: "Selesai", en: "Finish" },
  statusWaitingParticipants: {
    id: "Menunggu peserta",
    en: "Waiting for participants",
  },
  statusFinished: { id: "Kuis selesai", en: "Quiz finished" },
  questionNofM: { id: "Soal {i} dari {n}", en: "Question {i} of {n}" },
  lobbyHint: {
    id: "Bagikan kode dan mulai saat peserta siap.",
    en: "Share the code and start when participants are ready.",
  },
  finishedThanks: {
    id: "Terima kasih sudah bermain!",
    en: "Thanks for playing!",
  },
  joinAt: { id: "Peserta bergabung di", en: "Participants join at" },
  scoreboardHeading: { id: "Papan skor", en: "Scoreboard" },
  emptyParticipants: {
    id: "Belum ada peserta.",
    en: "No participants yet.",
  },

  // Analisis pembelajaran
  analyticsMetaTitle: {
    id: "Analisis Pembelajaran",
    en: "Learning Analytics",
  },
  analyticsTitle: { id: "Analisis pembelajaran", en: "Learning analytics" },
  analyticsDescription: {
    id: "Agregat atas siswa di kelompok Anda. Angka individu tidak ditampilkan — laporan ini untuk memantau tren kelompok.",
    en: "Aggregates for the students in your groups. Individual numbers are not shown — this report is for monitoring group trends.",
  },
  analyticsEmptyTitle: {
    id: "Belum ada data siswa",
    en: "No student data yet",
  },
  analyticsEmptyDescription: {
    id: "Buat kelompok dan tambahkan siswa terlebih dahulu. Analisis muncul begitu siswa mulai bermain.",
    en: "Create a group and add students first. Analytics appear once students start playing.",
  },
  monitoredStudents: { id: "Siswa terpantau", en: "Students monitored" },
  inGroups: { id: "di {n} kelompok", en: "in {n} groups" },
  avgMissionScore: { id: "Rata-rata nilai misi", en: "Average mission score" },
  fromAttempts: { id: "dari {n} percobaan", en: "from {n} attempts" },
  prePostHeading: {
    id: "Perkembangan pre → post test",
    en: "Pre → post test progress",
  },
  waitingAssessments: {
    id: "Menunggu siswa menyelesaikan pre-test dan post-test. Delta muncul di sini begitu keduanya tersedia.",
    en: "Waiting for students to complete the pre-test and post-test. The delta appears here once both are available.",
  },
  preTest: { id: "Pre-test", en: "Pre-test" },
  postTest: { id: "Post-test", en: "Post-test" },
  change: { id: "perubahan", en: "change" },
  privacyNote: {
    id: "Angka ini indikasi awal berdasarkan sampel kecil, bukan bukti efektivitas pembelajaran.",
    en: "These numbers are an early indication based on a small sample, not proof of learning effectiveness.",
  },
} satisfies Record<string, Localized>;
