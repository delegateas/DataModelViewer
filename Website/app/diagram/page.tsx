"use client";

import DiagramView from "@/components/diagramview/DiagramView";
import Layout from "@/components/shared/Layout";
import { DatamodelDataProvider } from "@/contexts/DatamodelDataContext";
import { DiagramViewProvider } from "@/contexts/DiagramViewContext";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <DatamodelDataProvider>
        <DiagramViewProvider>
          <Layout ignoreMargins={true}>
            <DiagramView />
          </Layout>
        </DiagramViewProvider>
      </DatamodelDataProvider>
    </Suspense>
  )
}