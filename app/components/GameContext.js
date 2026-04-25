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

  return (
    <GameContext.Provider value={{ profile, setProfile }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
