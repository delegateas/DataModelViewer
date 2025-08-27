"use client";

import { TouchProvider } from "@/components/shared/ui/hybridtooltop";
import { Loading } from "@/components/shared/ui/loading";
import DiagramView from "@/components/diagramview/DiagramView";
import { Suspense } from "react";
import { TooltipProvider } from "@/components/shared/ui/tooltip";

export default function Home() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <TooltipProvider>
          <DiagramView />
        </TooltipProvider>
      </TouchProvider>
    </Suspense>
}