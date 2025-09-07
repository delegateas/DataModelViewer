import { ProcessesView } from '@/components/processesview/ProcessesView';
import { DatamodelDataProvider } from "@/contexts/DatamodelDataContext";
import Layout from '@/components/shared/Layout';
import React, { Suspense } from 'react'

export default function Processes() {
  return (
      <Suspense>
          <DatamodelDataProvider>
              <Layout>
                  <ProcessesView />
              </Layout>
          </DatamodelDataProvider>
      </Suspense>
  )
}
