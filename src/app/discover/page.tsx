import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverScreen } from "@/features/discover/discover-screen";

export const metadata: Metadata = { title: "New game" };

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverScreen />
    </Suspense>
  );
}
