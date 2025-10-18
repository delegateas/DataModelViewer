import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { DatamodelDataProvider } from "@/contexts/DatamodelDataContext";
import Layout from "@/components/shared/Layout";
import { Suspense } from "react";
import { DatamodelViewProvider } from "@/contexts/DatamodelViewContext";

export default function Data() {
  return (
    <Suspense>
      <DatamodelViewProvider>
        <Layout>
          <DatamodelView />
        </Layout>
      </DatamodelViewProvider>
    </Suspense>
  )
}
