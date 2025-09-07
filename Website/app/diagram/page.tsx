"use client";

import DiagramView from "@/components/diagramview/DiagramView";
import Layout from "@/components/shared/Layout";
import { DiagramViewProvider } from "@/contexts/DiagramViewContext";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <DiagramViewProvider>
        <Layout>
          <DiagramView />
        </Layout>
      </DiagramViewProvider>
    </Suspense>
  )
}