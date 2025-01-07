import { DatamodelView } from "@/components/DatamodelView";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<p>Loading data</p>}>
      <DatamodelView />
    </Suspense>
}
