'use client'

import { useSidebar, useSidebarDispatch } from '@/contexts/SidebarContext'
import { SidebarClose, SidebarOpen } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import SidebarNavRail from './SidebarNavRail'
import clsx from 'clsx'

interface IAppSidebarProps {}

export const AppSidebar = ({}: IAppSidebarProps) => {
  const { element, isOpen } = useSidebar()
  const dispatch = useSidebarDispatch()
  const isMobile = useIsMobile()

  const toggleSidebar = () => {
    dispatch({ type: 'SET_OPEN', payload: !isOpen })
  }

  return (
    <>
      {/* Toggle Button (mobile only) */}
      {isMobile && (
        <button onClick={toggleSidebar}
          className={clsx(
            'fixed top-4 z-50 transition-all bg-white border border-gray-300 shadow rounded-full p-2',
            isOpen ? 'left-52' : 'left-4'
          )}
          aria-label={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
        >
          {isOpen ? <SidebarClose size={20} /> : <SidebarOpen size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={clsx('h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300',
          isMobile
            ? [
                'fixed top-0 left-0',
                isOpen ? 'translate-x-0' : '-translate-x-full',
                'flex flex-col'
              ]
            : 'flex flex-col sticky top-0'
        )}
      >
        {/* Header */}
        <div className="w-full h-16 border-b border-sidebar-border p-2 flex justify-center items-center bg-white">
          {isMobile ? (
            <img src="/DMVLOGO.svg" alt="Logo" className="h-full" draggable={false} />
          ) : (
            <img src="/DMVLOGOHORZ.svg" alt="Logo" className="h-full" draggable={false} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative flex">
          <SidebarNavRail />
          {element}
        </div>
      </div>
    </>
  )
}
