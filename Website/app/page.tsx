import { DatamodelView } from "@/components/DatamodelView";
import { Loading } from "@/components/ui/loading";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<Loading />}>
      <DatamodelView />
    </Suspense>
}
