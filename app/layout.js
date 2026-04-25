import { Special_Elite, Quicksand, Prompt } from "next/font/google";
import "./globals.css";
import { GameProvider } from "./components/GameContext";

const specialElite = Special_Elite({
  variable: "--font-special-elite",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600"],
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata = {
  title: "SEEN",
  description: "An interactive horror experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body
        className={`${specialElite.variable} ${quicksand.variable} ${prompt.variable} font-thai antialiased`}
      >
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}