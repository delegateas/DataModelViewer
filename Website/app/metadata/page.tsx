import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { DatamodelDataProvider } from "@/contexts/DatamodelDataContext";
import Layout from "@/components/shared/Layout";
import { Suspense } from "react";
import { DiagramViewProvider } from "@/contexts/DiagramViewContext";

export default function Data() {
  return (
    <Suspense>
      <DatamodelDataProvider>
        <Layout>
          <DatamodelView />
        </Layout>
      </DatamodelDataProvider>
    </Suspense>
  )
}
