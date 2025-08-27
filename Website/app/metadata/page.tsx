import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { TouchProvider } from "@/components/shared/ui/hybridtooltop";
import { Loading } from "@/components/shared/ui/loading";
import { TooltipProvider } from "@/components/shared/ui/tooltip";
import { DatamodelDataProvider } from "@/contexts/DatamodelDataContext";
import { Suspense } from "react";

export default function Data() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <TooltipProvider>
          <DatamodelDataProvider>
            <DatamodelView />
          </DatamodelDataProvider>
        </TooltipProvider>
      </TouchProvider>
    </Suspense>
}
