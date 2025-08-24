import { AboutView } from '@/components/aboutview/AboutView';
import { TouchProvider } from '@/components/shared/ui/hybridtooltop';
import { Loading } from '@/components/shared/ui/loading';
import React, { Suspense } from 'react'

export default function About() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <AboutView />
      </TouchProvider>
    </Suspense>
}
