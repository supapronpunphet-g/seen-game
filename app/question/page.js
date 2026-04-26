"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../components/GameContext";
import { supabase } from "../../lib/supabase";

const QUESTIONS = [
  {
    id: 1,
    question: "คุณใช้อุปกรณ์อะไรในการเข้าใช้แบบทดสอบนี้",
    theme: "light",
    choices: ["โทรศัพท์", "คอมพิวเตอร์", "แท็บเล็ต", "อื่น ๆ"],
  },
  {
    id: 2,
    question: "คุณใช้อินเทอร์เน็ตบ่อยแค่ไหน",
    theme: "light",
    choices: ["ทุกวัน", "บางวัน", "นาน ๆ ที"],
  },
  {
    id: 3,
    question: "ปกติคุณใช้เวลาหน้าจอนานแค่ไหนต่อวัน",
    theme: "light",
    choices: ["น้อยกว่า 2 ชั่วโมง", "2–5 ชั่วโมง", "มากกว่า 5 ชั่วโมง"],
  },
  {
    id: 4,
    question: "คุณชอบเล่นเกมไหม",
    theme: "light",
    choices: ["ชอบ", "เฉย ๆ", "ไม่ชอบ"],
  },
  {
    id: 5,
    question: "ตอนนี้คุณอยู่คนเดียวไหม",
    theme: "light",
    askCamera: true,
    choices: ["ใช่", "ไม่"],
  },
  {
    id: 6,
    question: "คุณกำลังเดินกลับบ้านตอนกลางคืน",
    theme: "dark",
    sounds: ["nightambiencearound.wav", "footsteps.mp3"],
    choices: [
      {
        text: "ใส่หูฟัง",
        story:
          "ระหว่างคุณใส่หูฟัง ฟังเพลงกลบบรรยากาศเงียบสงบ จู่ ๆ คุณได้ยินเสียงคนสองคนคุยกันดังมาจากที่ไกล ๆ แต่เสียงนั้น...ดูไม่เหมือนการคุยธรรมดา",
      },
      {
        text: "มองรอบ ๆ",
        story:
          "คุณมองรอบตัว ถนนเงียบกว่าปกติ ไฟข้างทางกะพริบเบา ๆ ก่อนที่เสียงคนสองคนจะดังขึ้นจากซอยข้างหน้า",
      },
      {
        text: "เล่นมือถือ",
        story:
          "คุณก้มมองมือถือ พยายามไม่สนใจความเงียบของถนน แต่เสียงตะโกนจากที่ไกล ๆ ทำให้คุณเงยหน้าขึ้นทันที",
      },
    ],
  },
  {
    id: 7,
    question: "คุณเห็นคนสองคนกำลังคุยกันเสียงดังผิดปกติ",
    theme: "dark",
    sounds: ["footsteps.mp3", "nightambiencearound.wav"],
    choices: [
      {
        text: "มองต่อ",
        story:
          "คุณหยุดมองต่อไป เงาของคนสองคนขยับอยู่ใต้ไฟสลัว เสียงหนึ่งดังขึ้นเหมือนกำลังขอร้อง แต่อีกเสียงกลับนิ่งจนน่ากลัว",
      },
      {
        text: "เดินผ่าน",
        story:
          "คุณพยายามเดินผ่านไปเหมือนไม่เห็นอะไร แต่ยิ่งเดิน เสียงด้านหลังยิ่งชัดขึ้น เหมือนเหตุการณ์นั้นกำลังดึงคุณกลับไป",
      },
      {
        text: "แอบฟัง",
        story:
          "คุณหลบอยู่ข้างกำแพงและตั้งใจฟัง คำพูดบางคำขาดหายไปในลม แต่มีประโยคหนึ่งที่ทำให้คุณรู้สึกเย็นวาบ",
      },
    ],
  },
  {
    id: 8,
    question: "คุณรู้สึกว่ามันไม่ใช่แค่การทะเลาะกัน",
    theme: "dark",
    sounds: ["nightambiencearound.wav"],
    choices: [
      {
        text: "หยิบมือถือ",
        story:
          "คุณหยิบมือถือขึ้นมา นิ้วแตะหน้าจออย่างสั่น ๆ คุณไม่แน่ใจว่าควรถ่ายไว้ หรือควรโทรหาใครสักคนก่อนที่ทุกอย่างจะสายเกินไป",
      },
      {
        text: "หันหลังกลับ",
        story:
          "คุณเลือกหันหลังกลับ แต่เสียงด้านหลังกลับดังขึ้นกว่าเดิม เหมือนมีบางอย่างเกิดขึ้นทันทีที่คุณตัดสินใจไม่มอง",
      },
      {
        text: "ยืนดู",
        story:
          "คุณยืนนิ่งอยู่ตรงนั้น ร่างกายเหมือนขยับไม่ได้ ทั้งที่ในหัวมีเสียงบอกให้คุณรีบหนีไป",
      },
    ],
  },
  {
    id: 9,
    question: "คุณตัดสินใจ?",
    theme: "dark",
    sounds: ["heartbeat.mp3"],
    choices: [
      {
        text: "ถ่ายคลิป",
        story:
          "คุณยกมือถือขึ้นอย่างช้า ๆ กล้องเริ่มบันทึกภาพ แต่ในจังหวะเดียวกัน คนคนนั้นเหมือนจะรู้ตัวว่ามีใครบางคนกำลังมองอยู่",
      },
      {
        text: "โทรขอความช่วยเหลือ",
        story:
          "คุณกดโทรออก มือของคุณเย็นเฉียบ เสียงรอสายดังขึ้นในหู แต่สายตาของคุณยังไม่กล้าละจากภาพตรงหน้า",
      },
      {
        text: "ไม่ทำอะไร",
        story:
          "คุณเลือกที่จะไม่ทำอะไร คุณหวังว่ามันจะไม่เกี่ยวกับคุณ แต่ความเงียบหลังจากนั้นกลับดังยิ่งกว่าเสียงกรีดร้อง",
      },
    ],
  },
  {
    id: 10,
    question: "มือถือคุณสั่น",
    theme: "dark",
    sounds: ["phone-ringing-sound.wav"],
    glitch: true,
    choices: [
      {
        text: "ปิดเครื่อง",
        story:
          "คุณรีบกดปิดเครื่อง หน้าจอดับลงทันที แต่แรงสั่นในมือคุณเหมือนยังไม่ยอมหยุด",
      },
      {
        text: "รับสาย",
        story:
          "คุณกดรับสาย ไม่มีเสียงพูดจากปลายสาย มีเพียงลมหายใจเบา ๆ ที่ใกล้เกินไป",
      },
      {
        text: "วางสาย",
        story:
          "คุณกดวางสายทันที แต่ไม่กี่วินาทีต่อมา เบอร์เดิมก็โทรกลับมาอีกครั้ง",
      },
    ],
  },
  {
    id: 11,
    question: "ฆาตกรหยุด...แล้วหันมามองคุณ",
    theme: "dark",
    sounds: ["heartbeat.mp3", "nightambiencearound.wav"],
    glitch: true,
    choices: [
      {
        text: "สบตา",
        story:
          "คุณเผลอสบตากับเขา ทุกอย่างเงียบลงทันที เหมือนทั้งถนนเหลือแค่คุณกับสายตาคู่นั้น",
      },
      {
        text: "หลบตา",
        scaryPause: "เขาเห็นคุณแล้ว",
        story:
          "คุณรีบหลบตา แต่ความรู้สึกหนึ่งบอกคุณว่า มันสายเกินไปแล้ว เขาเห็นคุณแล้ว",
      },
      {
        text: "แกล้งทำเป็นไม่เห็น",
        mutateTo: "โกหก",
        scaryPause: "เขาเห็นคุณแล้ว",
        story:
          "คุณทำเป็นไม่เห็นอะไรและก้าวต่อไป แต่เสียงฝีเท้าด้านหลังเริ่มเปลี่ยนจังหวะ เหมือนกำลังตามคุณมา",
      },
    ],
  },
  {
    id: 12,
    question: "คุณหนีออกมาได้",
    theme: "dark",
    sounds: ["heartbeat.mp3"],
    choices: [
      {
        text: "โทรแจ้งตำรวจ",
        story:
          "คุณโทรแจ้งตำรวจ เสียงของคุณสั่นจนแทบพูดไม่รู้เรื่อง แต่คุณยังพยายามเล่าทุกอย่างที่เห็น",
      },
      {
        text: "กลับบ้าน",
        story:
          "คุณรีบกลับบ้าน ล็อกประตูทุกบาน แต่ยิ่งเงียบ คุณยิ่งได้ยินเสียงฝีเท้าในความทรงจำชัดขึ้น",
      },
      {
        text: "ลบทุกอย่าง",
        mutateTo: "ลบแล้วคิดว่าจะหายเหรอ",
        story:
          "คุณลบทุกอย่างในมือถือ หวังว่าถ้าไม่มีหลักฐาน เรื่องนี้ก็จะไม่ตามมาหาคุณ",
      },
    ],
  },
  {
    id: 13,
    question: "ถ้ามีข่าวว่ามีคนถูกฆาตกรรมแถวบ้าน คุณจะทำอย่างไรต่อ",
    theme: "dark",
    sounds: ["nightambiencearound.wav"],
    choices: [
      {
        text: "แจ้งข้อมูล",
        story:
          "คุณตัดสินใจแจ้งข้อมูล แม้จะกลัว แต่คุณรู้ว่าความเงียบของคุณอาจทำให้ใครบางคนไม่ได้รับความยุติธรรม",
      },
      {
        text: "เงียบรอดูสถานการณ์",
        mutateTo: "เงียบเหมือนเดิม",
        story:
          "คุณเลือกเงียบก่อน บอกตัวเองว่ารอดูอีกนิดคงไม่เป็นไร แต่ในใจคุณรู้ดีว่าความเงียบนี้มีราคา",
      },
      {
        text: "กลัว ไม่ทำอะไร",
        mutateTo: "ไม่ทำอะไรอีกแล้ว",
        story:
          "คุณกลัวเกินกว่าจะทำอะไร คุณปิดข่าว ปิดหน้าจอ และพยายามทำเหมือนไม่เคยเห็นอะไรทั้งนั้น",
      },
    ],
  },
  {
    id: 14,
    question: "มีเบอร์แปลกโทรมา",
    theme: "dark",
    sounds: ["phone-ringing-sound.wav"],
    glitch: true,
    choices: [
      {
        text: "รับ",
        story:
          "คุณกดรับสาย ปลายสายเงียบไปครู่หนึ่ง ก่อนจะมีเสียงกระซิบเบา ๆ ว่า คุณจำผมได้ไหม",
      },
      {
        text: "ไม่รับ",
        mutateTo: "รับสิ",
        story:
          "คุณปล่อยให้สายดังจนตัดไปเอง แต่ทันทีที่หน้าจอดับ ข้อความหนึ่งก็เด้งขึ้นมาแทน",
      },
      {
        text: "บล็อก",
        mutateTo: "บล็อกไม่ได้",
        story:
          "คุณกดบล็อกเบอร์นั้นอย่างรวดเร็ว แต่ไม่กี่วินาทีต่อมา มีอีกเบอร์โทรเข้ามา",
      },
    ],
  },
  {
    id: 15,
    special: "typingMessage",
    question: "เห็นอะไรไหม",
    theme: "dark",
    sounds: ["phone-typingtexting.mp3"],
    glitch: true,
    choices: ["ไม่", "ใช่"],
  },
  {
    id: 16,
    question: "คุณเริ่มไม่มั่นใจว่าคุณปลอดภัยไหม",
    theme: "dark",
    sounds: ["nightambiencearound.wav"],
    choices: [
      {
        text: "ออกจากบ้านหาที่หลบซ่อน",
        story:
          "คุณคว้าของจำเป็นแล้วออกจากบ้าน ถนนข้างนอกเงียบเกินไป ทุกเงาที่ขยับทำให้คุณสะดุ้ง",
      },
      {
        text: "ขังตัวเองอยู่ในบ้าน",
        story:
          "คุณล็อกประตูทุกบาน ปิดไฟทุกดวง และนั่งฟังเสียงรอบบ้านอย่างหวาดระแวง",
      },
      {
        text: "ขอความช่วยเหลือ",
        story:
          "คุณส่งข้อความขอความช่วยเหลือไปหาคนที่ไว้ใจ แต่ระหว่างรอคำตอบ คุณได้ยินเสียงบางอย่างหน้าประตู",
      },
    ],
  },
  {
    id: 17,
    question: "ฆาตกรส่งมาอีก: ถ้าคุณเงียบ คุณจะไม่เป็นอะไร",
    theme: "dark",
    sounds: ["heartbeat.mp3"],
    glitch: true,
    choices: [
      {
        text: "ทำตามที่เขาบอก",
        mutateTo: "เงียบไว้",
        story:
          "คุณจ้องข้อความนั้นอยู่นาน แล้วเลือกที่จะเงียบ ความกลัวทำให้คุณยอมแลกความจริงกับความปลอดภัยของตัวเอง",
      },
      {
        text: "ปฏิเสธ",
        story:
          "คุณพิมพ์ตอบกลับไปว่าไม่ ข้อความถูกส่งออกไปแล้ว และทันทีหลังจากนั้น ห้องทั้งห้องก็ดูเงียบผิดปกติ",
      },
      {
        text: "เงียบประเมิน",
        mutateTo: "เขารออยู่",
        story:
          "คุณยังไม่ตอบอะไร คุณพยายามคิดหาทางออก แต่ทุกวินาทีที่ผ่านไปทำให้คุณรู้สึกเหมือนเขากำลังรออยู่",
      },
    ],
  },
  {
    id: 18,
    question: "ถ้าคุณถูกตำรวจเรียกไปเป็นพยานให้กับคดีฆาตกรรม",
    theme: "dark",
    sounds: ["KnockingonWoodDoor.wav"],
    choices: [
      {
        text: "ไป",
        story:
          "คุณตัดสินใจไปเป็นพยาน แม้จะรู้ว่าหลังจากนี้ชีวิตคุณอาจไม่ปลอดภัยเหมือนเดิมอีกต่อไป",
      },
      {
        text: "ไม่ไป",
        mutateTo: "ไม่กล้าไป",
        scaryPause: "ก๊อก ก๊อก ก๊อก",
        story:
          "คุณปฏิเสธการเป็นพยาน เสียงเคาะประตูดังขึ้นในคืนนั้น เหมือนมีใครบางคนรู้คำตอบของคุณแล้ว",
      },
      {
        text: "หลบไป",
        story:
          "คุณเลือกหลบหนี ปิดทุกช่องทางติดต่อ แต่ความรู้สึกว่าถูกตามยังคงไม่หายไป",
      },
    ],
  },
  {
    id: 19,
    question: "สุดท้ายแล้วคุณเลือกที่จะทำอะไร",
    theme: "dark",
    sounds: ["SpaceStationDrone.wav"],
    choices: ["พูดความจริงทั้งหมด", "ช่วยฆาตกรปิดบัง", "ปิดเรื่องเงียบ ไม่บอกใคร"],
  },
];

const TYPING_LINES = [
  "เมื่อกี้...",
  "เห็นอะไรไหม...",
  "เห็นไหม...",
  "เห็นใช่ไหม",
];

const SCORE_MAP = {
  6: {
    "ใส่หูฟัง": { morality: 0, fear: 0 },
    "มองรอบ ๆ": { morality: 1, fear: 1 },
    "เล่นมือถือ": { morality: -1, fear: 0 },
  },
  7: {
    "มองต่อ": { morality: 1, fear: 1 },
    "เดินผ่าน": { morality: -1, fear: 0 },
    "แอบฟัง": { morality: 1, fear: 2 },
  },
  8: {
    "หยิบมือถือ": { morality: 1, fear: 1 },
    "หันหลังกลับ": { morality: -1, fear: 1 },
    "ยืนดู": { morality: 0, fear: 2 },
  },
  9: {
    "ถ่ายคลิป": { morality: 1, fear: 1 },
    "โทรขอความช่วยเหลือ": { morality: 2, fear: 1 },
    "ไม่ทำอะไร": { morality: -2, fear: 1 },
  },
  10: {
    "ปิดเครื่อง": { morality: -1, fear: 2 },
    "รับสาย": { morality: 1, fear: 2 },
    "วางสาย": { morality: 0, fear: 2 },
  },
  11: {
    "สบตา": { morality: 1, fear: 3 },
    "หลบตา": { morality: -1, fear: 3 },
    "แกล้งทำเป็นไม่เห็น": { morality: -2, fear: 3 },
  },
  12: {
    "โทรแจ้งตำรวจ": { morality: 2, fear: 1 },
    "กลับบ้าน": { morality: 0, fear: 2 },
    "ลบทุกอย่าง": { morality: -2, fear: 2 },
  },
  13: {
    "แจ้งข้อมูล": { morality: 2, fear: 1 },
    "เงียบรอดูสถานการณ์": { morality: -1, fear: 1 },
    "กลัว ไม่ทำอะไร": { morality: -2, fear: 2 },
  },
  14: {
    "รับ": { morality: 1, fear: 3 },
    "ไม่รับ": { morality: 0, fear: 2 },
    "บล็อก": { morality: 0, fear: 2 },
  },
  15: {
    "ไม่": { morality: -1, fear: 2 },
    "ใช่": { morality: 1, fear: 2 },
  },
  16: {
    "ออกจากบ้านหาที่หลบซ่อน": { morality: 0, fear: 2 },
    "ขังตัวเองอยู่ในบ้าน": { morality: 0, fear: 2 },
    "ขอความช่วยเหลือ": { morality: 1, fear: 1 },
  },
  17: {
    "ทำตามที่เขาบอก": { morality: -2, fear: 2 },
    "ปฏิเสธ": { morality: 2, fear: 2 },
    "เงียบประเมิน": { morality: 0, fear: 2 },
  },
  18: {
    "ไป": { morality: 2, fear: 1 },
    "ไม่ไป": { morality: -1, fear: 2 },
    "หลบไป": { morality: -2, fear: 2 },
  },
  19: {
    "พูดความจริงทั้งหมด": { morality: 3, fear: 1 },
    "ช่วยฆาตกรปิดบัง": { morality: -3, fear: 1 },
    "ปิดเรื่องเงียบ ไม่บอกใคร": { morality: -2, fear: 1 },
  },
};

const scoreFor = (questionNumber, answerText) =>
  SCORE_MAP[questionNumber]?.[answerText] ?? { morality: 0, fear: 0 };

const decideEnding = (totalMorality) => {
  if (totalMorality >= 8) {
    return {
      ending_type: "The Witness",
      final_message:
        "คุณเลือกพูดความจริง แม้ความกลัวจะเดินตามหลังทุกก้าว ความเงียบอาจทำให้คุณรอด แต่คุณเลือกให้ใครบางคนได้รับความยุติธรรม",
    };
  }
  if (totalMorality >= 1) {
    return {
      ending_type: "The Survivor",
      final_message:
        "คุณรอดออกมาได้ แต่บางคำตอบยังติดอยู่ในใจ คุณไม่ได้เป็นคนผิดทั้งหมด แต่คุณก็รู้ดีว่าความเงียบของคุณมีน้ำหนัก",
    };
  }
  return {
    ending_type: "One of Him",
    final_message:
      "คุณไม่ได้ลงมือ แต่คุณเลือกปิดตา เลือกเงียบ และปล่อยให้ความจริงหายไป คืนนั้นคุณอาจรอดออกมาได้ แต่บางส่วนของคุณได้ยืนอยู่ข้างเดียวกับฆาตกรแล้ว",
  };
};

export default function QuestionPage() {
  const router = useRouter();
  const {
    profile,
    playerId,
    answers,
    setAnswers,
    setEndingResult,
  } = useGame();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const answersRef = useRef(answers);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [hasAskedCamera, setHasAskedCamera] = useState(false);

  const [showStory, setShowStory] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [storyFinished, setStoryFinished] = useState(false);

  const [typingText, setTypingText] = useState("");
  const [typingFinished, setTypingFinished] = useState(false);

  const [bigCenterText, setBigCenterText] = useState("");
  const [isGlitching, setIsGlitching] = useState(false);
  const [mutatedChoices, setMutatedChoices] = useState({});

  const audioRefs = useRef([]);
  const timeoutsRef = useRef([]);
  const glitchTimerRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const isDark = currentQuestion.theme === "dark";
  const isTypingQuestion = currentQuestion.special === "typingMessage";

  const displayName = useMemo(() => {
    const nick = profile?.nickname?.trim();
    const real = profile?.realName?.trim();
    return nick || real || "คุณ";
  }, [profile]);

  const selectedText = typeof selected === "string" ? selected : selected?.text;

  const fastMessages = useMemo(
    () => [
      `คิดดี ๆ ก่อนก็ได้ ${displayName}`,
      `รีบตอบไปไหน ${displayName}`,
      `แน่ใจเหรอ ${displayName}`,
      "บางคำตอบมันย้อนกลับไม่ได้นะ",
    ],
    [displayName]
  );

  const slowMessages = useMemo(
    () => [
      `ทำไมใช้เวลานานจัง ${displayName}`,
      `ยังอยู่หน้าจอใช่ไหม ${displayName}`,
      `ลังเลอยู่เหรอ ${displayName}`,
      "หรือคุณกำลังกลัว",
    ],
    [displayName]
  );

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];

  const showTemporaryMessage = (text, duration = 2200) => {
    setMessage(text);
    const id = setTimeout(() => setMessage(""), duration);
    timeoutsRef.current.push(id);
  };

  const triggerGlitch = () => {
    // Cancel any glitch timer that's still mid-flight so a new shake
    // doesn't get cut short by the previous one's release.
    if (glitchTimerRef.current) {
      clearTimeout(glitchTimerRef.current);
      glitchTimerRef.current = null;
    }

    setIsGlitching(true);

    const id = setTimeout(() => {
      setIsGlitching(false);
      glitchTimerRef.current = null;
    }, 280);

    glitchTimerRef.current = id;
    timeoutsRef.current.push(id);
  };

  const stopAllSounds = () => {
    audioRefs.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    audioRefs.current = [];
  };

  const playSounds = (sounds = []) => {
    stopAllSounds();

    sounds.forEach((sound) => {
      const audio = new Audio(`/sounds/${sound}`);
      audio.volume = 0.45;

      if (
        sound.includes("nightambience") ||
        sound.includes("footsteps") ||
        sound.includes("heartbeat") ||
        sound.includes("SpaceStationDrone")
      ) {
        audio.loop = true;
      }

      audio.play().catch(() => {
        console.log("Sound blocked or missing:", sound);
      });

      audioRefs.current.push(audio);
    });
  };

  const typeStory = (text) => {
    setShowStory(true);
    setStoryText("");
    setStoryFinished(false);

    let i = 0;

    const typeNext = () => {
      if (i <= text.length) {
        setStoryText(text.slice(0, i));
        i += 1;

        const id = setTimeout(typeNext, 38);
        timeoutsRef.current.push(id);
      } else {
        setStoryFinished(true);
      }
    };

    typeNext();
  };

  const handleChoice = (choice) => {
    const answerTime = Date.now() - questionStartTime;

    setSelected(choice);

    if (currentQuestion.glitch && Math.random() < 0.45) {
      triggerGlitch();
    }

    if (!isTypingQuestion && answerTime < 1300 && Math.random() < 0.55) {
      showTemporaryMessage(randomFrom(fastMessages));
    }
  };

  const askCameraPermission = async () => {
    setHasAskedCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      cameraStreamRef.current = stream;
      showTemporaryMessage(`คุณอนุญาตให้เรามองเห็นแล้ว ${displayName}`, 2600);

      // Permission was the only thing we needed — stop the tracks
      // immediately so the OS-level camera indicator doesn't stay on.
      stream.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    } catch {
      showTemporaryMessage(`ไม่อนุญาตเหรอ ${displayName}...เข้าใจแล้ว`, 2600);
    }
  };

  const sendHorrorEmail = async () => {
    if (!profile?.email) return;

    try {
      await fetch("/api/send-horror-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profile.email,
          nickname: profile.nickname || profile.realName || "you",
        }),
      });
    } catch (error) {
      console.log("Email failed:", error);
    }
  };

  const finalizeGame = async () => {
    if (finalizing) return;
    setFinalizing(true);
    stopAllSounds();

    const allAnswers = answersRef.current;
    let totalMorality = 0;
    let totalFear = 0;

    const enriched = allAnswers.map((a) => {
      const score = scoreFor(a.questionId, a.answer);
      totalMorality += score.morality;
      totalFear += score.fear;
      return {
        question_number: a.questionId,
        answer: a.answer,
        morality_score: score.morality,
        fear_score: score.fear,
      };
    });

    const ending = decideEnding(totalMorality);
    const endingForUI = {
      ending_type: ending.ending_type,
      total_morality: totalMorality,
      total_fear: totalFear,
      final_message: ending.final_message,
    };

    if (playerId) {
      const { error: aErr } = await supabase.from("answers").insert(
        enriched.map((row) => ({
          player_id: playerId,
          ...row,
        }))
      );
      if (aErr) {
        console.error("insert answers failed full:", {
          message: aErr?.message,
          details: aErr?.details,
          hint: aErr?.hint,
          code: aErr?.code,
        });
      }

      const { error: eErr } = await supabase.from("ending_results").insert({
        player_id: playerId,
        ending_type: ending.ending_type,
        total_morality: totalMorality,
        total_fear: totalFear,
      });
      if (eErr) {
        console.error("insert ending failed full:", {
          message: eErr?.message,
          details: eErr?.details,
          hint: eErr?.hint,
          code: eErr?.code,
        });
      }
    } else {
      console.warn("no playerId in context — skipping Supabase save");
    }

    setEndingResult(endingForUI);
    router.push("/result");
  };

  const goNextQuestion = () => {
    setSelected(null);
    setMessage("");
    setShowStory(false);
    setStoryText("");
    setStoryFinished(false);
    setTypingText("");
    setTypingFinished(false);
    setBigCenterText("");
    setMutatedChoices({});

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finalizeGame();
    }
  };

  const showScaryPauseThenStory = (pauseText, story) => {
    setBigCenterText(pauseText);
    triggerGlitch();

    const id = setTimeout(() => {
      setBigCenterText("");
      typeStory(story);
    }, 1200);

    timeoutsRef.current.push(id);
  };

  const flashNoEnding = () => {
    const words = [
      "เหรอ?",
      displayName,
      "เหรอ?",
      displayName,
      "เห็นอยู่แล้ว",
      displayName,
      "อย่าโกหก",
    ];

    let i = 0;

    const flash = () => {
      if (i < words.length) {
        setBigCenterText(words[i]);

        if (i % 2 === 0) {
          triggerGlitch();
        }

        i += 1;

        const id = setTimeout(flash, 520);
        timeoutsRef.current.push(id);
      } else {
        setBigCenterText("");
        goNextQuestion();
      }
    };

    flash();
  };

  const handleNext = async () => {
    if (showStory) {
      if (!storyFinished) return;
      goNextQuestion();
      return;
    }

    if (!selected) return;

    const newAnswers = [
      ...answersRef.current,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        answer: selectedText,
      },
    ];

    answersRef.current = newAnswers;
    setAnswers(newAnswers);

    if (currentQuestion.askCamera && !hasAskedCamera) {
      await askCameraPermission();
    }

    if (isTypingQuestion && selectedText === "ไม่") {
      setSelected(null);
      await sendHorrorEmail();
      flashNoEnding();
      return;
    }

    if (isTypingQuestion && selectedText === "ใช่") {
      setSelected(null);
      setBigCenterText("ดี");

      const id = setTimeout(() => {
        setBigCenterText("");
        goNextQuestion();
      }, 900);

      timeoutsRef.current.push(id);
      return;
    }

    if (typeof selected !== "string" && selected.story) {
      if (selected.scaryPause) {
        showScaryPauseThenStory(selected.scaryPause, selected.story);
      } else {
        typeStory(selected.story);
      }
      return;
    }

    goNextQuestion();
  };

  useEffect(() => {
    clearAllTimeouts();

    setQuestionStartTime(Date.now());
    setSelected(null);
    setMessage("");
    setShowStory(false);
    setStoryText("");
    setStoryFinished(false);
    setTypingText("");
    setTypingFinished(false);
    setBigCenterText("");
    setMutatedChoices({});

    if (currentQuestion.sounds) {
      playSounds(currentQuestion.sounds);
    } else {
      stopAllSounds();
    }

    if (currentQuestion.glitch) {
      const g = setTimeout(triggerGlitch, 900);
      timeoutsRef.current.push(g);
    }

    if (currentQuestion.special === "typingMessage") {
      let lineIndex = 0;
      let charIndex = 0;
      let fullText = "";

      const typeNextChar = () => {
        if (lineIndex >= TYPING_LINES.length) {
          const finishId = setTimeout(() => {
            setTypingText("");
            setTypingFinished(true);
          }, 850);

          timeoutsRef.current.push(finishId);
          return;
        }

        let currentLine = TYPING_LINES[lineIndex];

        if (lineIndex === TYPING_LINES.length - 1) {
          currentLine = `${displayName} ${currentLine}`;
        }

        if (charIndex < currentLine.length) {
          fullText += currentLine[charIndex];
          setTypingText(fullText);
          charIndex += 1;

          const id = setTimeout(typeNextChar, 95);
          timeoutsRef.current.push(id);
        } else {
          fullText += "\n";
          setTypingText(fullText);

          lineIndex += 1;
          charIndex = 0;

          const id = setTimeout(typeNextChar, 650);
          timeoutsRef.current.push(id);
        }
      };

      const startId = setTimeout(typeNextChar, 500);
      timeoutsRef.current.push(startId);
      return;
    }

    if (currentQuestion.id >= 11) {
      const mutateId = setTimeout(() => {
        const choices = currentQuestion.choices || [];
        const newMutations = {};

        choices.forEach((choice) => {
          if (
            typeof choice !== "string" &&
            choice.mutateTo &&
            Math.random() < 0.75
          ) {
            newMutations[choice.text] = choice.mutateTo;
          }
        });

        setMutatedChoices(newMutations);

        if (Object.keys(newMutations).length > 0) {
          triggerGlitch();
        }
      }, 2200);

      timeoutsRef.current.push(mutateId);
    }

    const timer = setTimeout(() => {
      if (Math.random() < 0.55) {
        showTemporaryMessage(randomFrom(slowMessages));
      }
    }, 10000);

    timeoutsRef.current.push(timer);
  }, [currentIndex, displayName]);

  useEffect(() => {
    return () => {
      stopAllSounds();
      clearAllTimeouts();
      // Last-resort camera cleanup — askCameraPermission already stops
      // tracks after grant, but if the user navigates away mid-permission
      // prompt or before the await resolves, the stream could still be
      // alive in the ref.
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    };
  }, []);

  return (
    <main
      className={`page-in relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-8 transition-colors duration-700 ${
        isDark ? "bg-black" : "bg-white"
      }`}
    >
      <style jsx>{`
        @keyframes horrorShake {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-1px, 1px);
          }
          50% {
            transform: translate(1px, -1px);
          }
          75% {
            transform: translate(-1px, 0);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes textFlickerSoft {
          0%,
          100% {
            opacity: 1;
          }
          45% {
            opacity: 0.82;
          }
          50% {
            opacity: 1;
          }
        }

        .horror-shake {
          animation: horrorShake 0.16s linear 2;
        }

        .text-flicker {
          animation: textFlickerSoft 2.2s infinite;
        }
      `}</style>

      {bigCenterText && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black">
          <p className="horror-shake font-thai text-6xl font-medium text-white">
            {bigCenterText}
          </p>
        </div>
      )}

      {message && !bigCenterText && (
        <div
          className={`fixed left-1/2 top-8 z-50 -translate-x-1/2 rounded-full border-2 px-6 py-3 text-sm shadow-lg ${
            isDark
              ? "border-white bg-black text-white"
              : "border-black bg-white text-black"
          }`}
        >
          {message}
        </div>
      )}

      <section
        className={`w-full max-w-lg border-2 px-7 py-7 transition-colors duration-700 ${
          isGlitching ? "horror-shake" : ""
        } ${
          isDark
            ? "border-white bg-black text-white"
            : "border-black bg-white text-black"
        }`}
      >
        <div
          className={`border-b pb-4 ${isDark ? "border-white" : "border-black"}`}
        >
          <p
            className={`inline-block rounded-full border px-4 py-1 text-xs font-black uppercase tracking-[0.12em] ${
              isDark ? "border-white text-white" : "border-black text-black"
            }`}
          >
            คำถามที่ {currentQuestion.id}
          </p>

          {!isTypingQuestion && !showStory && (
            <h1
              className={`mt-4 font-thai text-2xl leading-relaxed ${
                currentQuestion.glitch ? "text-flicker" : ""
              }`}
            >
              {currentQuestion.question}
            </h1>
          )}

          {displayName && !isTypingQuestion && !showStory && (
            <p
              className={`mt-2 text-sm ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {displayName}
            </p>
          )}

          {showStory && (
            <p className="mt-4 font-thai text-xs tracking-[0.24em] opacity-60">
              บันทึก
            </p>
          )}
        </div>

        {showStory ? (
          <div className="mt-8 min-h-[240px] rounded-3xl border-2 px-6 py-6">
            <p className="whitespace-pre-line font-thai text-xl leading-loose">
              {storyText}
              {!storyFinished && <span className="animate-pulse">|</span>}
            </p>
          </div>
        ) : isTypingQuestion ? (
          <>
            {!typingFinished ? (
              <div className="mt-8 min-h-[260px] rounded-3xl border-2 border-white bg-neutral-950 px-7 py-7">
                <p className="whitespace-pre-line font-thai text-2xl leading-loose text-white">
                  {typingText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {currentQuestion.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handleChoice(choice)}
                    className={`w-full rounded-full border-2 px-5 py-3 text-center font-thai transition ${
                      selected === choice
                        ? "border-white bg-white text-black"
                        : "border-white bg-black text-white hover:bg-white hover:text-black"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-7 space-y-3">
            {currentQuestion.choices.map((choice) => {
              const originalText =
                typeof choice === "string" ? choice : choice.text;
              const shownText = mutatedChoices[originalText] || originalText;
              const active = selectedText === originalText;

              return (
                <button
                  key={originalText}
                  type="button"
                  onClick={() => handleChoice(choice)}
                  className={`w-full border-2 px-5 py-3 text-left font-thai transition ${
                    mutatedChoices[originalText] ? "text-flicker" : ""
                  } ${
                    isDark
                      ? active
                        ? "border-white bg-white text-black"
                        : "border-white bg-black text-white hover:bg-white hover:text-black"
                      : active
                        ? "border-black bg-black text-white"
                        : "border-black bg-white text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {shownText}
                </button>
              );
            })}
          </div>
        )}

        <div
          className={`mt-7 text-center text-sm ${
            isDark ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          {currentIndex + 1} / {QUESTIONS.length}
        </div>

        <button
          onClick={handleNext}
          disabled={
            showStory
              ? !storyFinished
              : isTypingQuestion
                ? !typingFinished || !selected
                : !selected
          }
          className={`mt-5 w-full rounded-full border-2 py-3 text-sm font-bold tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-40 ${
            isDark
              ? "border-white bg-white text-black hover:bg-neutral-200"
              : "border-black bg-black text-white hover:bg-neutral-800"
          }`}
        >
          ถัดไป
        </button>
      </section>
    </main>
  );
}