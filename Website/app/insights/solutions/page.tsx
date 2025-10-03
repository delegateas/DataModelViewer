import Layout from "@/components/shared/Layout";
import InsightsView from "@/components/insightsview/InsightsView";
import { Suspense } from "react";

export default function InsightsSolutions() {
  return (
    <Suspense>
      <Layout>
        <InsightsView />
      </Layout>
    </Suspense>
  )
}