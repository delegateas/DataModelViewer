import { AboutView } from '@/components/aboutview/AboutView';
import React, { Suspense } from 'react'

export default function About() {
  return (
    <Suspense>
      <AboutView />
    </Suspense>
  )
}
