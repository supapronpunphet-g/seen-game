"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../components/GameContext";
import { supabase } from "../../lib/supabase";

const FIELDS = [
  { name: "realName", label: "ชื่อจริง", type: "text", autoComplete: "name" },
  { name: "nickname", label: "ชื่อเล่น", type: "text", autoComplete: "nickname" },
  { name: "email", label: "อีเมล", type: "email", autoComplete: "email" },
  {
    name: "age",
    label: "อายุ",
    type: "number",
    autoComplete: "off",
    min: 1,
    max: 120,
  },
];

const GENDERS = [
  { value: "female", label: "หญิง" },
  { value: "male", label: "ชาย" },
  { value: "other", label: "อื่น ๆ" },
];

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    setProfile,
    setPlayerId,
    setAnswers,
    setEndingResult,
  } = useGame();
  const [form, setForm] = useState(profile);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("players")
      .insert({
        real_name: form.realName,
        nickname: form.nickname,
        email: form.email,
        age: Number(form.age),
        gender: form.gender,
      })
      .select("id")
      .single();

    if (error) {
      console.error("insert player failed full:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });
      const friendly =
        error?.code === "23505"
          ? "อีเมลนี้ถูกใช้ไปแล้ว ลองอีเมลอื่น"
          : error?.message || "บันทึกข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง";
      alert(friendly);
      setSubmitting(false);
      return;
    }

    setProfile(form);
    setPlayerId(data.id);
    setAnswers([]);
    setEndingResult(null);
    router.push("/question");
  };

  return (
    <main className="page-in flex min-h-screen items-center justify-center bg-white px-5 py-8">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="w-full max-w-lg border-2 border-black px-8 py-8"
      >
        {/* Header */}
        <div className="border-b border-black pb-4">
          <h1 className="font-thai text-2xl font-medium text-black">
            ให้เรารู้จักคุณมากขึ้นอีกนิด
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            ข้อมูลนี้จะถูกใช้ในแบบทดสอบของคุณ
          </p>
        </div>

        {/* Fields */}
        <div className="mt-6 space-y-5">
          {FIELDS.map((f) => (
            <label key={f.name} className="block">
              <span className="field-label">{f.label}</span>

              <input
                type={f.type}
                value={form[f.name]}
                onChange={update(f.name)}
                autoComplete={f.autoComplete}
                min={f.min}
                max={f.max}
                required
                className="field-input mt-2"
              />
            </label>
          ))}

          {/* Gender */}
          <fieldset className="pt-1">
            <legend className="field-label">เพศ</legend>

            <div className="mt-3 flex gap-2">
              {GENDERS.map((g) => {
                const active = form.gender === g.value;

                return (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        gender: g.value,
                      }))
                    }
                    className={`flex-1 rounded-full border-2 px-4 py-2 text-sm transition ${
                      active
                        ? "border-black bg-black text-white"
                        : "border-black bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!form.gender || submitting}
          className="mt-8 w-full rounded-full border-2 border-black bg-black py-3 text-sm font-bold tracking-[0.15em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "กำลังบันทึก..." : "ถัดไป"}
        </button>
      </form>
    </main>
  );
}
