'use client'

import React, { useEffect, useState } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { LastSynched } from '@/generated/Data'
import { Box, Typography, Link, Paper } from '@mui/material'

interface IAboutViewProps {}

export const AboutView = ({}: IAboutViewProps) => {
  const { setElement, dispatch, close } = useSidebar()
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    setElement(null);
    close();
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
  }, [setElement, dispatch])

  return (
    <Box className="flex min-h-screen">
      <Box className="flex-1 overflow-auto" sx={{ backgroundColor: 'background.default' }}>
        <Box className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-12">
            {/* Logo */}
            <Box className="flex justify-center mb-10">
              <Box className="flex items-center">
                <Box
                  component="img"
                  className="h-20 sm:h-28 md:h-32 object-contain"
                  src="/DMVLOGO.svg"
                  alt="Data Model Viewer logo"
                />
                <Box className="flex flex-col ml-4 mt-4 justify-center h-full">
                  <Typography variant='h4' className='m-0 p-0 leading-8'>DATA MODEL</Typography>
                  <Typography variant='h2' className='m-0 p-0 font-semibold leading-14'>VIEWER</Typography>
                  <Typography variant='caption' color='text.secondary'>@ DELEGATE | CONTEXT&</Typography>
                </Box>
              </Box>
            </Box>

            {/* What is DMV */}
            <Paper 
              className="p-6 sm:p-8 mb-10 flex flex-col lg:flex-row items-center gap-8"
              elevation={2}
              sx={{ 
                borderRadius: 4,
                backgroundColor: 'background.paper'
              }}
            >
              <Box className="flex-1 text-center lg:text-left">
                <Typography 
                  variant="h4" 
                  component="h2" 
                  className="text-2xl sm:text-3xl font-semibold mb-4"
                  sx={{ color: 'text.primary' }}
                >
                  What is Data Model Viewer?
                </Typography>
                <Typography 
                  className="mb-4"
                  sx={{ color: 'text.secondary' }}
                >
                  <Typography component="strong" sx={{ color: 'text.primary' }}>Data Model Viewer</Typography> is your centralized tool for exploring and understanding your Dataverse metadata. Designed with clarity and efficiency in mind, it gives you a single, streamlined access point to view and navigate your data tables.
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  Developed by <Typography component="strong" sx={{ color: 'text.primary' }}>Delegate</Typography>, it helps organizations save time, reduce complexity, and gain insights into their Dataverse environments—even without full access. It&apos;s a powerful tool for developers, analysts, and administrators alike.
                </Typography>
              </Box>
              <Box className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <Box
                  component="img"
                  src="/dataviewer.svg"
                  alt="Data model viewer interface"
                  className="w-full h-auto object-contain"
                />
              </Box>
            </Paper>

            {/* Setup and Features */}
            <Paper 
              className="p-6 sm:p-8 mb-10 flex flex-col lg:flex-row-reverse items-center gap-8"
              elevation={2}
              sx={{ 
                borderRadius: 4,
                backgroundColor: 'background.paper'
              }}
            >
              <Box className="flex-1 text-center lg:text-left">
                <Typography 
                  variant="h4" 
                  component="h2" 
                  className="text-2xl sm:text-3xl font-semibold mb-4"
                  sx={{ color: 'text.primary' }}
                >
                  Setup and Features
                </Typography>
                <Typography 
                  className="mb-4"
                  sx={{ color: 'text.secondary' }}
                >
                  All setup instructions, feature details, and known issues for Data Model Viewer are available on GitHub. Whether you&apos;re just getting started or tracking updates, GitHub serves as the central hub for all project information.
                </Typography>
                <Link
                  className="font-medium text-lg break-words"
                  href="https://github.com/delegateas/DataModelViewer"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark'
                    }
                  }}
                >
                  github.com/delegateas/DataModelViewer
                </Link>
              </Box>
              <Box className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <Box
                  component="img"
                  src="/datasetup.svg"
                  alt="Setup instructions illustration"
                  className="w-full h-auto object-contain"
                />
              </Box>
            </Paper>

            {/* Credits */}
            <Box className="text-center">
              <Typography>Icons by <b>480 Design</b> <a target='_blank' className='underline text-blue-400' href="https://www.figma.com/@480design">Figma</a> </Typography>
            </Box>

            {/* Version */}
            <Box className="text-center text-sm mt-8">
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                Version {version ?? '...'}
              </Typography>
            </Box>

            {/* Data Sync */}
            <Box className="text-center text-sm mt-8">
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                Last synchronization: <Typography component="strong" sx={{ color: 'text.secondary' }}>
                  {LastSynched ? LastSynched.toLocaleString('en-DK', { 
                      timeZone: 'Europe/Copenhagen',
                      timeZoneName: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                  }) : '...'}
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
  )
}