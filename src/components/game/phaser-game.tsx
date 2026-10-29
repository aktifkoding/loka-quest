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

/**
 * Browser-only Phaser scene that walks the learner through mission questions
 * and collects their answers. Correctness is NOT evaluated here — the server
 * scores submissions and returns per-question results.
 */
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
      // Phaser touches window/document on import — only load in the browser
      const Phaser = (await import("phaser")).default;
      if (cancelled) return;

      // Aligned with the app theme: nila indigo + sogan gold, warm white text
      const UI = {
        bg: "#10152e",
        panel: "#1a2142",
        text: "#f2f0e9",
        muted: "#9aa0b8",
        accent: "#8b9cf5",
        accentDark: "#3d4a9e",
        gold: "#f0b429",
      };

      class MissionScene extends Phaser.Scene {
        private currentQuestionIndex = 0;
        private answers: { questionId: string; answer: Record<string, unknown> }[] = [];

        constructor() {
          super("MissionScene");
        }

        create() {
          this.showIntro();
        }

        showIntro() {
          const { width, height } = this.scale;
          this.cameras.main.setBackgroundColor(UI.bg);
          this.children.removeAll(true);

          this.add
            .text(width / 2, height / 2 - 80, "Misi: " + mission.title, {
              fontFamily: "Arial, sans-serif",
              fontSize: "32px",
              fontStyle: "bold",
              color: UI.text,
              align: "center",
              wordWrap: { width: width - 120 },
            })
            .setOrigin(0.5);

          this.add
            .text(width / 2, height / 2 - 20, `${questions.length} tantangan menanti`, {
              fontFamily: "Arial, sans-serif",
              fontSize: "18px",
              color: UI.muted,
            })
            .setOrigin(0.5);

          const startBtn = this.add
            .text(width / 2, height / 2 + 60, "Mulai Petualangan", {
              fontFamily: "Arial, sans-serif",
              fontSize: "20px",
              color: "#ffffff",
              backgroundColor: UI.accentDark,
              padding: { x: 32, y: 14 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

          startBtn.on("pointerover", () => startBtn.setScale(1.05));
          startBtn.on("pointerout", () => startBtn.setScale(1));
          startBtn.on("pointerdown", () => this.showQuestion());
        }

        showQuestion() {
          this.children.removeAll(true);
          const { width, height } = this.scale;
          const question = questions[this.currentQuestionIndex];

          if (!question) {
            this.showSubmit();
            return;
          }

          // Progress bar
          const progress = this.currentQuestionIndex / questions.length;
          this.add
            .rectangle(width / 2, 24, (width - 80) * progress, 10, 0x8b9cf5)
            .setOrigin(0.5);

          // Question text
          this.add
            .text(width / 2, 110, question.prompt, {
              fontFamily: "Arial, sans-serif",
              fontSize: "20px",
              color: UI.text,
              align: "center",
              wordWrap: { width: width - 100 },
              lineSpacing: 6,
            })
            .setOrigin(0.5);

          const typeLabel: Record<string, string> = {
            multiple_choice: "Pilih jawaban yang tepat",
            matching: "Pasangkan dengan maknanya",
            sequencing: "Urutkan cerita dengan benar",
            identification: "Identifikasi yang diminta",
          };

          this.add
            .text(width / 2, 185, typeLabel[question.question_type] ?? "Jawab pertanyaan", {
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              color: UI.gold,
            })
            .setOrigin(0.5);

          if (question.question_type === "multiple_choice") {
            this.renderChoices(question, width);
          } else {
            this.renderFallback(question, width);
          }

          this.add.text(
            width / 2,
            height - 30,
            `Pertanyaan ${this.currentQuestionIndex + 1} dari ${questions.length}`,
            { fontFamily: "Arial, sans-serif", fontSize: "13px", color: UI.muted }
          ).setOrigin(0.5);
        }

        renderChoices(question: PhaserGameQuestion, width: number) {
          const choices =
            (question.options as { choices?: string[] }).choices ?? [];
          const startY = 240;
          const gap = 66;

          choices.forEach((choice, index) => {
            const y = startY + index * gap;
            const btn = this.add
              .text(width / 2, y, choice, {
                fontFamily: "Arial, sans-serif",
                fontSize: "17px",
                color: UI.text,
                backgroundColor: UI.panel,
                padding: { x: 24, y: 14 },
                align: "center",
                wordWrap: { width: width - 120 },
              })
              .setOrigin(0.5)
              .setInteractive({ useHandCursor: true });

            btn.on("pointerover", () => btn.setBackgroundColor(UI.accentDark));
            btn.on("pointerout", () => btn.setBackgroundColor(UI.panel));
            btn.on("pointerdown", () => {
              this.recordAnswer(question, { selected: choice });
            });
          });
        }

        renderFallback(question: PhaserGameQuestion, width: number) {
          // Non-multiple-choice questions use a simplified free-answer UI:
          // the learner types a short answer; validation is server-side.
          const answered = { value: "" };

          this.add
            .text(width / 2, 250, "Ketik jawabanmu di bawah, lalu tekan Kirim", {
              fontFamily: "Arial, sans-serif",
              fontSize: "15px",
              color: UI.muted,
            })
            .setOrigin(0.5);

          const display = this.add
            .text(width / 2, 310, "_", {
              fontFamily: "Arial, sans-serif",
              fontSize: "20px",
              color: UI.gold,
              backgroundColor: UI.panel,
              padding: { x: 20, y: 12 },
              align: "center",
              fixedWidth: 420,
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

          display.on("pointerdown", () => {
            const answer = window.prompt(question.prompt);
            if (answer !== null && answer.trim() !== "") {
              answered.value = answer.trim();
              display.setText(answered.value);
            }
          });

          const submitBtn = this.add
            .text(width / 2, 400, "Kirim Jawaban", {
              fontFamily: "Arial, sans-serif",
              fontSize: "18px",
              color: "#ffffff",
              backgroundColor: UI.accentDark,
              padding: { x: 28, y: 12 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

          submitBtn.on("pointerdown", () => {
            this.recordAnswer(question, { value: answered.value });
          });
        }

        recordAnswer(question: PhaserGameQuestion, answer: Record<string, unknown>) {
          this.answers.push({ questionId: question.id, answer });

          const { width, height } = this.scale;
          this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

          this.add
            .text(width / 2, height / 2 - 40, "Jawaban tersimpan", {
              fontFamily: "Arial, sans-serif",
              fontSize: "28px",
              fontStyle: "bold",
              color: UI.accent,
            })
            .setOrigin(0.5);

          this.add
            .text(width / 2, height / 2 + 10, "Hasil akan dinilai setelah misi selesai", {
              fontFamily: "Arial, sans-serif",
              fontSize: "15px",
              color: UI.muted,
            })
            .setOrigin(0.5);

          const nextBtn = this.add
            .text(
              width / 2,
              height / 2 + 70,
              this.currentQuestionIndex + 1 < questions.length ? "Lanjut" : "Selesai",
              {
                fontFamily: "Arial, sans-serif",
                fontSize: "18px",
                color: "#ffffff",
                backgroundColor: UI.accentDark,
                padding: { x: 28, y: 12 },
              }
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

          nextBtn.on("pointerdown", () => {
            this.currentQuestionIndex++;
            this.showQuestion();
          });
        }

        showSubmit() {
          this.children.removeAll(true);
          const { width, height } = this.scale;

          this.add
            .text(width / 2, height / 2 - 50, "Semua tantangan selesai!", {
              fontFamily: "Arial, sans-serif",
              fontSize: "38px",
              fontStyle: "bold",
              color: UI.accent,
            })
            .setOrigin(0.5);

          this.add
            .text(width / 2, height / 2 + 10, "Mengirim jawaban untuk dinilai...", {
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              color: UI.gold,
            })
            .setOrigin(0.5);

          this.time.delayedCall(1500, () => {
            onCompleteRef.current(this.answers);
          });
        }
      }

      if (cancelled) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: container,
        backgroundColor: UI.bg,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
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
