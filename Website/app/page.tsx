import { HomeView } from "@/components/homeview/HomeView";
import Layout from "@/components/shared/Layout";
import { Suspense } from "react";

export default function Data() {
  // TODO - loading component fallback={<Loading />}
  return (
    <Suspense>
      <Layout>
        <HomeView />
      </Layout>
    </Suspense>
  );
}
