"use client";

import { TouchProvider } from "@/components/ui/hybridtooltop";
import { Loading } from "@/components/ui/loading";
import DiagramView from "@/components/diagram/DiagramView";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <DiagramView />
      </TouchProvider>
    </Suspense>
}