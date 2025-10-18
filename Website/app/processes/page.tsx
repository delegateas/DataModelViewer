import { ProcessesView } from '@/components/processesview/ProcessesView';
import Layout from '@/components/shared/Layout';
import React, { Suspense } from 'react'

export default function Processes() {
    return (
        <Suspense>
            <Layout>
                <ProcessesView />
            </Layout>
        </Suspense>
    )
}
