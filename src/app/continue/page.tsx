import type { Metadata } from "next";
import { ContinueScreen } from "@/features/continue/continue-screen";

export const metadata: Metadata = { title: "Continue" };

export default function ContinuePage() {
  return <ContinueScreen />;
}
