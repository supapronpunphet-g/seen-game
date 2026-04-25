"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SeenTitle from "./components/SeenTitle";
import WarningModal from "./components/WarningModal";

export default function Home() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [backCount, setBackCount] = useState(0);

  // กดย้อนกลับแค่ 1 ครั้ง ปุ่มย้อนกลับจะเปลี่ยนเป็น "โอเค" ถาวร
  const swapped = backCount >= 1;

  const goToProfile = () => router.push("/profile");
  const handleStart = () => setModalOpen(true);

  const handleBack = () => {
    if (swapped) {
      goToProfile();
      return;
    }

    setBackCount(1);
    setModalOpen(false);
  };

  const handleConfirm = () => goToProfile();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="page-in flex flex-col items-center">
        <SeenTitle />

        <button
          type="button"
          onClick={handleStart}
          className="start-btn mt-10"
          aria-label="START"
        >
          START
        </button>
      </div>

      <WarningModal
        open={modalOpen}
        onBack={handleBack}
        onConfirm={handleConfirm}
        backLabel={swapped ? "โอเค" : "ย้อนกลับ"}
      />
    </main>
  );
}