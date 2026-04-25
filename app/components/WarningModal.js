"use client";

import { useEffect, useRef, useState } from "react";

export default function WarningModal({
  open,
  onBack,
  onConfirm,
  backLabel = "ย้อนกลับ",
}) {
  const audioRef = useRef(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const firstButtonRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSoundOn(false);
  };

  // Race-safe: read audioRef (synchronous) instead of soundOn (state).
  const toggleSound = () => {
    if (audioRef.current) {
      stopSound();
      return;
    }

    const a = new Audio("/sounds/nightambiencearound.wav");
    a.volume = 0.25;
    a.loop = true;
    a.play().catch(() => {});
    audioRef.current = a;
    setSoundOn(true);
  };

  // Save the previously-focused element on open, restore it on close.
  useEffect(() => {
    if (!open) return;

    triggerRef.current =
      typeof document !== "undefined" ? document.activeElement : null;

    // Defer focus until the modal is in the DOM.
    const id = window.setTimeout(() => firstButtonRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(id);
      triggerRef.current?.focus?.();
    };
  }, [open]);

  // Escape closes via onBack; Tab is trapped inside the dialog.
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onBack?.();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onBack]);

  // Stop the looping ambience if the modal unmounts while it's playing.
  useEffect(() => {
    return () => stopSound();
  }, []);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-title"
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-[#d9d9d9] px-4"
    >
      <div className="modal-card relative w-[72vw] max-w-[900px] min-h-[430px] border-[3px] border-neutral-600 bg-[#eeeeee] px-10 py-9 shadow-[10px_10px_0px_0px_rgba(80,80,80,0.75)]">
        <h2
          id="warning-title"
          className="font-thai text-[24px] font-medium text-neutral-900"
        >
          คำแนะนำ
        </h2>

        <p className="mt-2 font-thai text-[15px] font-light tracking-[0.02em] text-neutral-500">
          ก่อนเริ่มแบบทดสอบ กรุณาอ่านเงื่อนไขสั้น ๆ ด้านล่าง
        </p>

        <div className="mt-9 space-y-5 font-thai text-[19px] font-normal leading-[2] text-neutral-800">
          <p>
            ขอบคุณที่ยินยอมเข้าร่วมแบบทดสอบนี้ แบบทดสอบจะใช้เวลาประมาณ
            5–10 นาที กรุณาอ่านคำถามและตอบอย่างระมัดระวัง
            เพื่อให้ประสบการณ์ดำเนินต่อไปอย่างสมบูรณ์
          </p>
          <p>
            แบบทดสอบนี้มีเสียงประกอบบางช่วง คุณสามารถปิดเสียงได้หากจำเป็น
            แต่เราแนะนำให้เปิดเสียงไว้ระหว่างเล่น{" "}
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              className="inline-flex items-center gap-1 text-[#9b0000] underline-offset-4 transition hover:underline"
            >
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>
              <span>ทดสอบเสียง</span>
            </button>
          </p>
        </div>

        <div className="absolute bottom-7 right-7 flex items-center gap-3">
          <button
            ref={firstButtonRef}
            type="button"
            onClick={onBack}
            className="border border-neutral-500 bg-[#eeeeee] px-7 py-3 font-thai text-[16px] font-normal text-neutral-700 transition hover:bg-neutral-200"
          >
            <span key={backLabel} className="label-swap">
              {backLabel}
            </span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            aria-label="ดำเนินการต่อ"
            className="flex h-12 w-16 items-center justify-center bg-[#990000] text-[30px] text-white transition hover:bg-[#7a0000]"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
