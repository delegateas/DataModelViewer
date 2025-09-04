"use client";

import DiagramView from "@/components/diagramview/DiagramView";
import Layout from "@/components/shared/Layout";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <Layout>
        <DiagramView />
      </Layout>
    </Suspense>
  )
}