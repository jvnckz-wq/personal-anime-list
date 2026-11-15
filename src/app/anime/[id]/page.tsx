import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailsScreen } from "@/features/details/details-screen";

export const metadata: Metadata = { title: "File details" };

export default function DetailsPage() {
  return (
    <Suspense fallback={null}>
      <DetailsScreen />
    </Suspense>
  );
}
