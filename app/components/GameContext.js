"use client";

import { createContext, useContext, useState } from "react";

const GameContext = createContext(null);

const initialProfile = {
  realName: "",
  nickname: "",
  email: "",
  age: "",
  gender: "",
};

export function GameProvider({ children }) {
  const [profile, setProfile] = useState(initialProfile);
  const [playerId, setPlayerId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [endingResult, setEndingResult] = useState(null);

  return (
    <GameContext.Provider
      value={{
        profile,
        setProfile,
        playerId,
        setPlayerId,
        answers,
        setAnswers,
        endingResult,
        setEndingResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
