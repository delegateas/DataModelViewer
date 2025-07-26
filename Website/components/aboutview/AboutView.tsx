'use client'

import React, { useEffect, useState } from 'react'
import { AppSidebar } from '../AppSidebar'
import { useSidebarDispatch } from '@/contexts/SidebarContext'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { LastSynched } from '@/generated/Data'

interface IAboutViewProps {}

export const AboutView = ({}: IAboutViewProps) => {
  const dispatch = useSidebarDispatch()
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    dispatch({ type: 'SET_ELEMENT', payload: <></> })
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
  }, [])

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <div className="flex-1 bg-stone-50 overflow-auto">
        <TooltipProvider delayDuration={0}>
          <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-12">
            {/* Logo */}
            <div className="flex justify-center mb-10">
              <img
                className="h-20 sm:h-28 md:h-32 object-contain"
                src="/DMVLOGOHORZ.svg"
                alt="Data Model Viewer logo"
              />
            </div>

            {/* What is DMV */}
            <div className="bg-white shadow-md rounded-2xl p-6 sm:p-8 mb-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
                  What is Data Model Viewer?
                </h2>
                <p className="text-gray-700 mb-4">
                  <strong>Data Model Viewer</strong> is your centralized tool for exploring and understanding your Dataverse metadata. Designed with clarity and efficiency in mind, it gives you a single, streamlined access point to view and navigate your data tables.
                </p>
                <p className="text-gray-700">
                  Developed by <strong>Delegate</strong>, it helps organizations save time, reduce complexity, and gain insights into their Dataverse environments—even without full access. It’s a powerful tool for developers, analysts, and administrators alike.
                </p>
              </div>
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <img
                  src="/dataviewer.svg"
                  alt="Data model viewer interface"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Setup and Features */}
            <div className="bg-white shadow-md rounded-2xl p-6 sm:p-8 mb-10 flex flex-col lg:flex-row-reverse items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
                  Setup and Features
                </h2>
                <p className="text-gray-700 mb-4">
                  All setup instructions, feature details, and known issues for Data Model Viewer are available on GitHub. Whether you’re just getting started or tracking updates, GitHub serves as the central hub for all project information.
                </p>
                <a
                  className="text-blue-600 hover:text-blue-800 font-medium text-lg break-words"
                  href="https://github.com/delegateas/DataModelViewer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/delegateas/DataModelViewer
                </a>
              </div>
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <img
                  src="/datasetup.svg"
                  alt="Setup instructions illustration"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Version */}
            <div className="text-center text-sm text-gray-500 mt-8">
              Version {version ?? '...'}
            </div>

            {/* Data Sync */}
            <div className="text-center text-sm text-gray-500 mt-8">
              Last Synched - {LastSynched ? LastSynched.toLocaleString(undefined, { timeZoneName: 'short' }) : '...'}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
