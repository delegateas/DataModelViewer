import { AboutView } from '@/components/aboutview/AboutView';
import { TouchProvider } from '@/components/ui/hybridtooltop';
import { Loading } from '@/components/ui/loading';
import React, { Suspense } from 'react'

export default function About() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <AboutView />
      </TouchProvider>
    </Suspense>
}
