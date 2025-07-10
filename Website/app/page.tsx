import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { TouchProvider } from "@/components/ui/hybridtooltop";
import { Loading } from "@/components/ui/loading";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <DatamodelView />
      </TouchProvider>
    </Suspense>
}
