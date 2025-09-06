import { AboutView } from '@/components/aboutview/AboutView';
import Layout from '@/components/shared/Layout';
import React, { Suspense } from 'react'

export default function About() {
  return (
      <Suspense>
          <Layout>
              <AboutView />
          </Layout>
      </Suspense>
  )
}
