import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { Loading } from "@/components/ui/loading";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<Loading />}>
      <DatamodelView />
    </Suspense>
}
