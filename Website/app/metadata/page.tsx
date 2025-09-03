import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { DatamodelDataProvider } from "@/contexts/DatamodelDataContext";
import { Suspense } from "react";

export default function Data() {
  return (
    <Suspense>
      <DatamodelDataProvider>
        <DatamodelView />
      </DatamodelDataProvider>
    </Suspense>
  )
}
