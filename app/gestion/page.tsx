import type { Metadata } from "next";
import { ScoreScreen } from "../_components/score-screen.tsx";

export const metadata: Metadata = {
  title: "Gestion des points",
};

export default function ManagePage() {
  return <ScoreScreen editable />;
}
