"use client";


import DiagramView from "@/components/diagramview/DiagramView";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <DiagramView />
    </Suspense>
  )
}