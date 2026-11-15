import type { Metadata } from "next";
import { FilesScreen } from "@/features/files/files-screen";

export const metadata: Metadata = { title: "Load game" };

export default function FilesPage() {
  return <FilesScreen />;
}
