import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { TouchProvider } from "@/components/shared/ui/hybridtooltop";
import { Loading } from "@/components/shared/ui/loading";
import { DatamodelDataProvider } from "@/contexts/DatamodelDataContext";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <DatamodelDataProvider>
          <DatamodelView />
        </DatamodelDataProvider>
      </TouchProvider>
    </Suspense>
}
