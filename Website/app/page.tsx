import { HomeView } from "@/components/homeview/HomeView";
import { Suspense } from "react";

export default function Data() {
  // TODO - loading component fallback={<Loading />}
  return (
    <Suspense>
      <HomeView />
    </Suspense>
  );
}
