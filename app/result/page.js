"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../components/GameContext";
import { supabase } from "../../lib/supabase";

const QUESTION_LABELS = {
  1: "คุณใช้อุปกรณ์อะไรในการเข้าใช้แบบทดสอบนี้",
  2: "คุณใช้อินเทอร์เน็ตบ่อยแค่ไหน",
  3: "ปกติคุณใช้เวลาหน้าจอนานแค่ไหนต่อวัน",
  4: "คุณชอบเล่นเกมไหม",
  5: "ตอนนี้คุณอยู่คนเดียวไหม",
  6: "คุณกำลังเดินกลับบ้านตอนกลางคืน",
  7: "คุณเห็นคนสองคนกำลังคุยกันเสียงดังผิดปกติ",
  8: "คุณรู้สึกว่ามันไม่ใช่แค่การทะเลาะกัน",
  9: "คุณตัดสินใจ?",
  10: "มือถือคุณสั่น",
  11: "ฆาตกรหยุด...แล้วหันมามองคุณ",
  12: "คุณหนีออกมาได้",
  13: "ถ้ามีข่าวว่ามีคนถูกฆาตกรรมแถวบ้าน คุณจะทำอย่างไรต่อ",
  14: "มีเบอร์แปลกโทรมา",
  15: "เห็นอะไรไหม",
  16: "คุณเริ่มไม่มั่นใจว่าคุณปลอดภัยไหม",
  17: "ฆาตกรส่งมาอีก: ถ้าคุณเงียบ คุณจะไม่เป็นอะไร",
  18: "ถ้าคุณถูกตำรวจเรียกไปเป็นพยานให้กับคดีฆาตกรรม",
  19: "สุดท้ายแล้วคุณเลือกที่จะทำอะไร",
};

export default function ResultPage() {
  const router = useRouter();
  const { answers, endingResult } = useGame();

  const [analytics, setAnalytics] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!endingResult) {
      router.replace("/");
      return;
    }
    const id = setTimeout(() => setRevealed(true), 250);
    return () => clearTimeout(id);
  }, [endingResult, router]);

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      setLoadingAnalytics(true);
      const { data, error } = await supabase
        .from("answers")
        .select("question_number, answer");

      if (cancelled) return;
      if (error) {
        console.error("load analytics failed:", {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        });
        setAnalytics([]);
        setLoadingAnalytics(false);
        return;
      }

      const grouped = {};
      data.forEach((row) => {
        if (!grouped[row.question_number]) grouped[row.question_number] = {};
        grouped[row.question_number][row.answer] =
          (grouped[row.question_number][row.answer] || 0) + 1;
      });

      const list = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b)
        .map((qNum) => {
          const counts = grouped[qNum];
          const total = Object.values(counts).reduce((s, n) => s + n, 0);
          const breakdown = Object.entries(counts)
            .map(([answer, count]) => ({
              answer,
              count,
              percent: total ? Math.round((count / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);
          return {
            questionNumber: qNum,
            label: QUESTION_LABELS[qNum] || `คำถามที่ ${qNum}`,
            total,
            breakdown,
          };
        });

      setAnalytics(list);
      setLoadingAnalytics(false);
    };

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  const playerAnswers = useMemo(
    () =>
      answers.map((a) => ({
        questionNumber: a.questionId,
        label: QUESTION_LABELS[a.questionId] || `คำถามที่ ${a.questionId}`,
        answer: a.answer,
      })),
    [answers]
  );

  if (!endingResult) return null;

  return (
    <main className="result-root">
      <style jsx>{`
        .result-root {
          position: relative;
          min-height: 100vh;
          background: #050505;
          color: #ededed;
          padding: 5rem 1.25rem 6rem;
          overflow: hidden;
        }

        .result-root::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse at 50% 20%,
              rgba(120, 0, 0, 0.18) 0%,
              transparent 55%
            ),
            radial-gradient(
              ellipse at 50% 100%,
              rgba(0, 0, 0, 0.95) 0%,
              transparent 70%
            );
          z-index: 0;
        }

        .result-root::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.02) 0px,
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px,
            transparent 3px
          );
          mix-blend-mode: overlay;
          z-index: 1;
        }

        .stage {
          position: relative;
          z-index: 2;
          margin: 0 auto;
          width: 100%;
          max-width: 44rem;
        }

        @keyframes riseIn {
          0% {
            opacity: 0;
            transform: translateY(14px);
            letter-spacing: 0.6em;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.32em;
          }
        }

        @keyframes softFlicker {
          0%,
          100% {
            opacity: 1;
            text-shadow:
              0 0 14px rgba(255, 255, 255, 0.18),
              0 0 1px rgba(220, 0, 0, 0.4);
          }
          47% {
            opacity: 0.78;
          }
          49% {
            opacity: 1;
          }
          63% {
            opacity: 0.92;
            text-shadow:
              0 0 6px rgba(255, 255, 255, 0.1),
              0 0 1px rgba(220, 0, 0, 0.6);
          }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .verdict-tag {
          display: inline-block;
          font-size: 0.66rem;
          letter-spacing: 0.5em;
          color: #b5b5b5;
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 0.35rem 1rem 0.35rem 1.5rem;
          text-transform: uppercase;
        }

        .ending-title {
          margin-top: 1.5rem;
          font-family: var(--font-special-elite), serif;
          font-size: clamp(2.6rem, 7vw, 4.4rem);
          line-height: 1;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f5f5f5;
          animation:
            riseIn 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) both,
            softFlicker 5.5s 1.6s infinite;
        }

        .crimson {
          color: #c4231d;
        }

        .hairline {
          margin: 2.5rem auto 2rem;
          width: 4rem;
          height: 1px;
          background: rgba(255, 255, 255, 0.4);
        }

        .final-message {
          font-family: var(--font-prompt), sans-serif;
          font-weight: 300;
          font-size: clamp(1.05rem, 2.4vw, 1.3rem);
          line-height: 2.05;
          color: #d8d8d8;
          max-width: 36rem;
          margin: 0 auto;
          text-align: center;
          opacity: 0;
          animation: fadeUp 1.4s 0.6s forwards;
        }

        .stats {
          margin-top: 4rem;
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          align-items: center;
          gap: 0;
          opacity: 0;
          animation: fadeUp 1.4s 1s forwards;
        }

        .stat {
          text-align: center;
          padding: 1.25rem 0.5rem;
        }

        .stat-label {
          font-size: 0.62rem;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: #8a8a8a;
        }

        .stat-value {
          margin-top: 0.6rem;
          font-family: var(--font-special-elite), serif;
          font-size: 2.6rem;
          color: #f0f0f0;
          letter-spacing: 0.06em;
        }

        .stat-divider {
          width: 1px;
          height: 3.5rem;
          background: rgba(255, 255, 255, 0.25);
          justify-self: center;
        }

        .section {
          margin-top: 4.5rem;
          opacity: 0;
          animation: fadeUp 1.2s forwards;
        }

        .section.delay-1 {
          animation-delay: 1.4s;
        }

        .section.delay-2 {
          animation-delay: 1.7s;
        }

        .section-tag {
          display: inline-block;
          font-size: 0.6rem;
          letter-spacing: 0.5em;
          color: #9a9a9a;
          padding-left: 0.5em;
          text-transform: uppercase;
        }

        .section-rule {
          margin-top: 0.75rem;
          height: 1px;
          width: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.45),
            rgba(255, 255, 255, 0)
          );
        }

        .dossier {
          margin-top: 1.75rem;
          display: grid;
          gap: 1.1rem;
        }

        .dossier-row {
          display: grid;
          grid-template-columns: 2.6rem 1fr;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
        }

        .dossier-num {
          font-family: var(--font-special-elite), serif;
          color: #6e6e6e;
          font-size: 0.95rem;
          padding-top: 0.15rem;
        }

        .dossier-q {
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: #8a8a8a;
          line-height: 1.55;
        }

        .dossier-a {
          margin-top: 0.4rem;
          font-family: var(--font-prompt), sans-serif;
          font-size: 1rem;
          color: #ededed;
        }

        .dossier-a::before {
          content: "→ ";
          color: #c4231d;
          margin-right: 0.25rem;
        }

        .analytics-list {
          margin-top: 1.75rem;
          display: grid;
          gap: 1.6rem;
        }

        .analytics-q {
          padding-bottom: 1.2rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
        }

        .analytics-q-label {
          font-size: 0.78rem;
          color: #9a9a9a;
          letter-spacing: 0.04em;
          line-height: 1.55;
        }

        .analytics-q-num {
          color: #c4231d;
          margin-right: 0.45rem;
          font-family: var(--font-special-elite), serif;
        }

        .analytics-bars {
          margin-top: 0.85rem;
          display: grid;
          gap: 0.55rem;
        }

        .bar-row {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 1rem;
        }

        .bar-track {
          position: relative;
          height: 1.55rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          background: linear-gradient(
            to right,
            rgba(196, 35, 29, 0.55),
            rgba(196, 35, 29, 0.18)
          );
          transition: width 1.2s ease;
        }

        .bar-text {
          position: relative;
          padding: 0 0.7rem;
          line-height: 1.55rem;
          font-size: 0.85rem;
          color: #ededed;
          font-family: var(--font-prompt), sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bar-pct {
          font-size: 0.78rem;
          color: #b5b5b5;
          font-family: var(--font-special-elite), serif;
          min-width: 3.5rem;
          text-align: right;
        }

        .empty {
          margin-top: 1.5rem;
          color: #6e6e6e;
          font-size: 0.85rem;
        }

        .footer {
          margin-top: 5rem;
          text-align: center;
          opacity: 0;
          animation: fadeUp 1.2s 2.2s forwards;
        }

        .back-btn {
          font-size: 0.7rem;
          letter-spacing: 0.45em;
          color: #6e6e6e;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.4s;
        }

        .back-btn:hover {
          color: #ededed;
        }
      `}</style>

      <div className={`stage ${revealed ? "is-revealed" : ""}`}>
        {/* Verdict */}
        <div style={{ textAlign: "center" }}>
          <span className="verdict-tag">VERDICT</span>
          <h1 className="ending-title">
            <span className="crimson">/</span>{" "}
            {endingResult.ending_type}{" "}
            <span className="crimson">/</span>
          </h1>
        </div>

        <div className="hairline" />

        {/* Final message */}
        <p className="final-message">{endingResult.final_message}</p>

        {/* Stats */}
        <div className="stats">
          <div className="stat">
            <p className="stat-label">Morality</p>
            <p className="stat-value">{endingResult.total_morality}</p>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <p className="stat-label">Fear</p>
            <p className="stat-value">{endingResult.total_fear}</p>
          </div>
        </div>

        {/* Player dossier */}
        {playerAnswers.length > 0 && (
          <section className="section delay-1">
            <span className="section-tag">— เส้นทางของคุณ</span>
            <div className="section-rule" />
            <div className="dossier">
              {playerAnswers.map((row) => (
                <div key={row.questionNumber} className="dossier-row">
                  <div className="dossier-num">
                    {String(row.questionNumber).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="dossier-q">{row.label}</p>
                    <p className="dossier-a">{row.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Analytics */}
        <section className="section delay-2">
          <span className="section-tag">— คนอื่นเลือกอะไร</span>
          <div className="section-rule" />

          {loadingAnalytics ? (
            <p className="empty">กำลังเปิดบันทึก...</p>
          ) : analytics.length === 0 ? (
            <p className="empty">ยังไม่มีบันทึกของผู้อื่น</p>
          ) : (
            <div className="analytics-list">
              {analytics.map((q) => (
                <div key={q.questionNumber} className="analytics-q">
                  <p className="analytics-q-label">
                    <span className="analytics-q-num">
                      Q{String(q.questionNumber).padStart(2, "0")}
                    </span>
                    {q.label}
                  </p>
                  <div className="analytics-bars">
                    {q.breakdown.map((row) => (
                      <div key={row.answer} className="bar-row">
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${row.percent}%` }}
                          />
                          <div className="bar-text">{row.answer}</div>
                        </div>
                        <div className="bar-pct">{row.percent}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="footer">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="back-btn"
          >
            ← กลับสู่ความเงียบ
          </button>
        </div>
      </div>
    </main>
  );
}
