"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

export interface PhaserGameMission {
  id: string;
  title: string;
  xp_reward: number;
}

export interface PhaserGameQuestion {
  id: string;
  question_type: string;
  prompt: string;
  options: Record<string, unknown>;
  explanation: string;
}

export interface PhaserGameProps {
  mission: PhaserGameMission;
  questions: PhaserGameQuestion[];
  onComplete: (answers: { questionId: string; answer: Record<string, unknown> }[]) => void;
}

/* ------------------------------------------------------------------ */
/* Gamelan synthesizer — WebAudio, zero external assets                */
/* ------------------------------------------------------------------ */

type InstrumentName = "saron" | "gong" | "kendang" | "bonang";

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

/** Pengaturan suara pengguna (disimpan lokal, default aktif). */
export function isSoundMuted(): boolean {
  try {
    return window.localStorage.getItem("lq-sound") === "off";
  } catch {
    return false;
  }
}

/**
 * Approximate gamelan instrument timbres with oscillators + noise.
 * Envelopes carry the character; pitches are pelog-adjacent.
 */
function playInstrument(name: InstrumentName) {
  if (isSoundMuted()) return;
  const ctx = getCtx();
  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);

  const tone = (
    freq: number,
    type: OscillatorType,
    start: number,
    peak: number,
    decay: number
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0 + start);
    gain.gain.setValueAtTime(0.0001, t0 + start);
    gain.gain.linearRampToValueAtTime(peak, t0 + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + decay);
    osc.connect(gain).connect(master);
    osc.start(t0 + start);
    osc.stop(t0 + start + decay + 0.05);
  };

  const noise = (duration: number, cutoff: number, peak: number) => {
    const len = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    gain.gain.value = peak;
    src.connect(filter).connect(gain).connect(master);
    src.start(t0);
  };

  switch (name) {
    // Bilah perunggu: terang, metalik, dentum singkat
    case "saron":
      tone(784, "square", 0, 0.28, 0.55);
      tone(1176, "square", 0, 0.12, 0.4);
      tone(1568, "sine", 0, 0.08, 0.3);
      break;
    // Gong besar: rendah, menggema lama
    case "gong":
      tone(98, "sine", 0, 0.5, 2.6);
      tone(147, "sine", 0, 0.22, 2.2);
      tone(196, "triangle", 0.02, 0.1, 1.8);
      noise(0.08, 900, 0.12);
      break;
    // Kendang: pukulan kulit dengan pitch turun
    case "kendang":
      tone(190, "sine", 0, 0.55, 0.22);
      {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(190, t0);
        osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.18);
        gain.gain.setValueAtTime(0.5, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24);
        osc.connect(gain).connect(master);
        osc.start(t0);
        osc.stop(t0 + 0.3);
      }
      noise(0.06, 1600, 0.3);
      break;
    // Bonang: dua kelanga saling detune, menggetar
    case "bonang":
      tone(622, "sine", 0, 0.3, 1.3);
      tone(629, "sine", 0, 0.3, 1.3);
      tone(1244, "sine", 0, 0.08, 0.9);
      break;
  }
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export function PhaserGame({ mission, questions, onComplete }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let game: Phaser.Game | null = null;
    let cancelled = false;

    (async () => {
      const Phaser = (await import("phaser")).default;
      if (cancelled) return;

      const UI = {
        bg: 0x10152e,
        panel: 0x1a2142,
        panelLight: 0x232b56,
        text: "#f2f0e9",
        muted: "#9aa0b8",
        accent: 0x8b9cf5,
        accentDark: 0x3d4a9e,
        gold: 0xf0b429,
        ok: 0x4ade80,
        line: 0x4a5494,
      };
      const FONT = "Arial, sans-serif";

      class MissionScene extends Phaser.Scene {
        private currentQuestionIndex = 0;
        private answers: { questionId: string; answer: Record<string, unknown> }[] = [];

        constructor() {
          super("MissionScene");
        }

        create() {
          this.showIntro();
        }

        /* ---------- shared UI helpers ---------- */

        private button(
          x: number,
          y: number,
          w: number,
          h: number,
          label: string,
          bgColor: number,
          textColor = UI.text,
          fontSize = 17
        ): Phaser.GameObjects.Container {
          const c = this.add.container(x, y);
          const g = this.add.graphics();
          const radius = Math.min(14, h / 2);
          g.fillStyle(bgColor, 1);
          g.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
          g.lineStyle(1.5, UI.line, 0.9);
          g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
          const txt = this.add
            .text(0, 0, label, {
              fontFamily: FONT,
              fontSize: `${fontSize}px`,
              color: textColor,
              align: "center",
              wordWrap: { width: w - 24 },
            })
            .setOrigin(0.5);
          c.add([g, txt]);
          c.setSize(w, h);
          c.setInteractive(
            new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
            Phaser.Geom.Rectangle.Contains
          );
          return c;
        }

        private chrome(questionIndex: number, total: number) {
          const { width } = this.scale;
          const progress = questionIndex / total;
          this.add.rectangle(width / 2, 22, width - 120, 8, UI.panelLight).setOrigin(0.5);
          this.add
            .rectangle(60 + (width - 120) * progress, 22, (width - 120) * progress, 8, UI.accent)
            .setOrigin(0.5);
        }

        private showIntro() {
          const { width, height } = this.scale;
          this.cameras.main.setBackgroundColor(UI.bg);
          this.children.removeAll(true);

          this.add
            .text(width / 2, height / 2 - 90, "Misi: " + mission.title, {
              fontFamily: FONT, fontSize: "32px", fontStyle: "bold", color: UI.text,
              align: "center", wordWrap: { width: width - 120 },
            })
            .setOrigin(0.5);

          this.add
            .text(width / 2, height / 2 - 30, `${questions.length} tantangan menanti`, {
              fontFamily: FONT, fontSize: "18px", color: UI.muted,
            })
            .setOrigin(0.5);

          const start = this.button(width / 2, height / 2 + 55, 260, 54, "Mulai Petualangan", UI.accentDark);
          start.on("pointerover", () => start.setScale(1.04));
          start.on("pointerout", () => start.setScale(1));
          start.on("pointerdown", () => this.showQuestion());
        }

        /* ---------- question router ---------- */

        private showQuestion() {
          this.children.removeAll(true);

          const q = questions[this.currentQuestionIndex];
          if (!q) {
            this.showSubmit();
            return;
          }

          const { width, height } = this.scale;
          this.chrome(this.currentQuestionIndex, questions.length);

          this.add
            .text(width / 2, 105, q.prompt, {
              fontFamily: FONT, fontSize: "20px", color: UI.text,
              align: "center", wordWrap: { width: width - 110 }, lineSpacing: 5,
            })
            .setOrigin(0.5);

          const labels: Record<string, string> = {
            multiple_choice: "Pilih satu jawaban",
            matching: "Ketuk motif, lalu ketuk maknanya",
            sequencing: "Ketuk kejadian sesuai urutan cerita",
            identification: "Dengarkan bunyinya, lalu tebak instrumennya",
          };
          this.add
            .text(width / 2, 178, labels[q.question_type] ?? "Jawab pertanyaan", {
              fontFamily: FONT, fontSize: "14px", color: "#f0b429",
            })
            .setOrigin(0.5);

          switch (q.question_type) {
            case "matching":
              this.renderMatching(q, width);
              break;
            case "sequencing":
              this.renderSequencing(q, width, height);
              break;
            case "identification":
              this.renderIdentification(q, width);
              break;
            default:
              this.renderChoices(q, width);
          }

          this.add
            .text(width / 2, height - 26,
              `Pertanyaan ${this.currentQuestionIndex + 1} dari ${questions.length}`,
              { fontFamily: FONT, fontSize: "13px", color: UI.muted })
            .setOrigin(0.5);
        }

        /* ---------- multiple choice ---------- */

        private renderChoices(q: PhaserGameQuestion, width: number) {
          const choices = (q.options as { choices?: string[] }).choices ?? [];
          choices.forEach((choice, i) => {
            const btn = this.button(width / 2, 245 + i * 64, 460, 52, choice, UI.panel, UI.text, 17);
            btn.on("pointerover", () => btn.setScale(1.02));
            btn.on("pointerout", () => btn.setScale(1));
            btn.on("pointerdown", () => this.recordAnswer(q, { selected: choice }));
          });
        }

        /* ---------- matching: tap kiri lalu kanan, garis penghubung ---------- */

        private renderMatching(q: PhaserGameQuestion, width: number) {
          const pairsMap = (q.options as { pairs?: Record<string, string> }).pairs ?? {};
          const pairs = Object.entries(pairsMap).map(([left, right]) => ({
            left,
            right,
            matched: "",
          }));

          const rights = Phaser.Utils.Array.Shuffle(pairs.map((p) => p.right));
          const colLeftX = width / 2 - 130;
          const colRightX = width / 2 + 130;
          const startY = 250;
          const gap = 78;

          const lines = this.add.graphics();
          let selectedLeft: string | null = null;
          let selectedBtn: Phaser.GameObjects.Container | null = null;

          const redrawBtn = (
            btn: Phaser.GameObjects.Container,
            w: number,
            h: number,
            bg: number,
            stroke: number
          ) => {
            const g = btn.list[0] as Phaser.GameObjects.Graphics;
            g.clear();
            g.fillStyle(bg, 1);
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
            g.lineStyle(2, stroke, 1);
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
          };

          pairs.forEach((pair, i) => {
            const y = startY + i * gap;
            const leftBtn = this.button(colLeftX, y, 210, 54, pair.left, UI.panel, UI.text, 16);
            const rightBtn = this.button(colRightX, y, 210, 54, rights[i], UI.panelLight, UI.muted, 16);

            leftBtn.on("pointerdown", () => {
              if (pair.matched) return;
              selectedLeft = pair.left;
              selectedBtn = leftBtn;
              redrawBtn(leftBtn, 210, 54, UI.accentDark, UI.gold);
            });

            rightBtn.on("pointerdown", () => {
              if (!selectedLeft || !selectedBtn) return;
              if (pairs.some((p) => p.matched === rights[i])) return;
              const target = pairs.find((p) => p.left === selectedLeft);
              if (!target) return;
              target.matched = rights[i];

              lines.lineStyle(3, UI.ok, 0.9);
              lines.beginPath();
              lines.moveTo(colLeftX + 105, y);
              lines.lineTo(colRightX - 105, startY + rights.indexOf(rights[i]) * gap);
              lines.strokePath();

              redrawBtn(leftBtn, 210, 54, UI.panel, UI.line);
              redrawBtn(rightBtn, 210, 54, UI.panel, UI.line);
              (rightBtn.list[1] as Phaser.GameObjects.Text).setColor(UI.text);
              selectedLeft = null;
              selectedBtn = null;
            });
          });

          const submitBtn = this.button(width / 2, 555, 250, 50, "Kirim Pemasangan", UI.accentDark, "#ffffff", 17);
          submitBtn.setAlpha(0.45);
          const poll = this.time.addEvent({
            delay: 200,
            repeat: 60,
            callback: () => {
              if (pairs.every((p) => p.matched)) {
                submitBtn.setAlpha(1);
                poll.remove();
              }
            },
          });
          submitBtn.on("pointerdown", () => {
            if (!pairs.every((p) => p.matched)) return;
            const matches: Record<string, string> = {};
            pairs.forEach((p) => (matches[p.left] = p.matched));
            this.recordAnswer(q, { matches });
          });
        }

        /* ---------- sequencing: ketuk sesuai urutan ---------- */

        private renderSequencing(q: PhaserGameQuestion, width: number, height: number) {
          const events = ((q.options as { events?: string[] }).events ?? []) as string[];
          const shuffled = Phaser.Utils.Array.Shuffle([...events]);
          const sequence: string[] = [];

          const slots: Phaser.GameObjects.Container[] = [];
          const slotTexts: Phaser.GameObjects.Text[] = [];
          events.forEach((_, i) => {
            const slot = this.button(width / 2, 245 + i * 50, 430, 42, `${i + 1}. …`, UI.panel, UI.muted, 15);
            slots.push(slot);
            slotTexts.push(slot.list[1] as Phaser.GameObjects.Text);
          });

          const chips = shuffled.map((text, i) => ({
            text,
            container: this.button(width / 2, height - 138 + i * 46, 450, 40, text, UI.panelLight, UI.text, 14),
          }));

          const refresh = () => {
            slots.forEach((_, i) => {
              const filled = i < sequence.length;
              slotTexts[i].setText(filled ? `${i + 1}. ${sequence[i]}` : `${i + 1}. …`);
              slotTexts[i].setColor(filled ? UI.text : UI.muted);
            });
            if (sequence.length === events.length) {
              const submit = this.button(width / 2, 520, 240, 50, "Kirim Urutan", UI.accentDark, "#ffffff", 17);
              submit.on("pointerdown", () => {
                if (sequence.length !== events.length) return;
                this.recordAnswer(q, { order: [...sequence] });
              });
            }
          };

          chips.forEach((chip) => {
            chip.container.on("pointerdown", () => {
              if (sequence.length >= events.length || sequence.includes(chip.text)) return;
              sequence.push(chip.text);
              chip.container.setVisible(false);
              refresh();
            });
          });

          // ketuk slot untuk mengembalikan chip terakhir dari slot itu
          slots.forEach((slot, i) => {
            slot.on("pointerdown", () => {
              if (sequence.length <= i) return;
              const removed = sequence.splice(i);
              removed.forEach((txt) => {
                const chip = chips.find((c) => c.text === txt);
                if (chip) chip.container.setVisible(true);
              });
              refresh();
            });
          });
        }

        /* ---------- identification: audio sintetis ---------- */

        private renderIdentification(q: PhaserGameQuestion, width: number) {
          const instruments = (q.options as { instruments?: string[] }).instruments ?? [];
          const playable: InstrumentName[] = ["saron", "gong", "kendang", "bonang"];
          const found = instruments.find((i) => playable.includes(i.toLowerCase() as InstrumentName));
          const soundName = (found ?? "saron").toLowerCase() as InstrumentName;

          const playBtn = this.button(width / 2, 250, 310, 54, "▶  Dengarkan bunyinya", UI.accentDark, "#ffffff", 18);
          playBtn.on("pointerdown", () => {
            playInstrument(soundName);
            playBtn.setScale(0.96);
            this.time.delayedCall(120, () => playBtn.setScale(1));
          });

          this.add
            .text(width / 2, 302, isSoundMuted() ? "Suara nonaktif — grafik tetap bisa dinikmati" : "Boleh diputar berkali-kali", {
              fontFamily: FONT, fontSize: "13px", color: UI.muted,
            })
            .setOrigin(0.5);

          instruments.forEach((inst, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const btn = this.button(
              width / 2 + (col === 0 ? -115 : 115), 380 + row * 64, 215, 52, inst, UI.panel, UI.text, 17
            );
            btn.on("pointerover", () => btn.setScale(1.03));
            btn.on("pointerout", () => btn.setScale(1));
            btn.on("pointerdown", () => this.recordAnswer(q, { selected: inst }));
          });
        }

        /* ---------- simpan jawaban + overlay ---------- */

        private recordAnswer(question: PhaserGameQuestion, answer: Record<string, unknown>) {
          this.answers.push({ questionId: question.id, answer });

          const { width, height } = this.scale;
          this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
          this.add
            .text(width / 2, height / 2 - 42, "Jawaban tersimpan", {
              fontFamily: FONT, fontSize: "28px", fontStyle: "bold", color: "#4ade80",
            })
            .setOrigin(0.5);
          this.add
            .text(width / 2, height / 2 + 8, "Hasil dinilai server setelah misi selesai", {
              fontFamily: FONT, fontSize: "15px", color: UI.muted,
            })
            .setOrigin(0.5);

          const isLast = this.currentQuestionIndex + 1 >= questions.length;
          const nextBtn = this.button(
            width / 2, height / 2 + 68, 200, 50, isLast ? "Selesai" : "Lanjut", UI.accentDark, "#ffffff", 18
          );
          nextBtn.on("pointerdown", () => {
            this.currentQuestionIndex++;
            this.showQuestion();
          });
        }

        /* ---------- selesai ---------- */

        private showSubmit() {
          this.children.removeAll(true);
          const { width, height } = this.scale;

          this.add
            .text(width / 2, height / 2 - 50, "Semua tantangan selesai!", {
              fontFamily: FONT, fontSize: "38px", fontStyle: "bold", color: "#4ade80",
            })
            .setOrigin(0.5);
          this.add
            .text(width / 2, height / 2 + 10, "Mengirim jawaban untuk dinilai…", {
              fontFamily: FONT, fontSize: "16px", color: "#f0b429",
            })
            .setOrigin(0.5);

          this.time.delayedCall(1500, () => onCompleteRef.current(this.answers));
        }
      }

      if (cancelled) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: container,
        backgroundColor: UI.bg,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [MissionScene],
      });
    })();

    return () => {
      cancelled = true;
      if (game) {
        game.destroy(true);
        game = null;
      }
    };
  }, [mission, questions]);

  return <div ref={containerRef} className="w-full" />;
}
