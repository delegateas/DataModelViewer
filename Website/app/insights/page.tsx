'use client'

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/shared/Layout";
import InsightsView from "@/components/insightsview/InsightsView";
import { Suspense } from "react";

export default function Insights() {
  return (
    <Suspense>
      <InsightsRedirect />
    </Suspense>
  )
}

function InsightsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const view = searchParams.get('view');
    if (!view) {
      // Default to overview view
      router.replace('/insights?view=overview');
    }
  }, [router, searchParams]);

  return (
    <Layout>
      <InsightsView />
    </Layout>
  );
}