'use client'

import { useSidebar, useSidebarDispatch } from '@/contexts/SidebarContext'
import { SidebarClose, SidebarOpen } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import SidebarNavRail from './SidebarNavRail'
import clsx from 'clsx'

interface IAppSidebarProps {}

export const AppSidebar = ({}: IAppSidebarProps) => {
  const { element, isOpen, showElement } = useSidebar()
  const dispatch = useSidebarDispatch()
  const isMobile = useIsMobile()

  const toggleSidebar = () => {
    dispatch({ type: 'SET_OPEN', payload: !isOpen })
  }

  const toggleElement = () => {
    dispatch({ type: 'SET_SHOW_ELEMENT', payload: !showElement })
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

      {/* Overlay for mobile sidebar */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={toggleSidebar}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'h-screen bg-sidebar border-r border-sidebar-border z-40',
          'transition-all duration-300',
          isMobile
            ? [
                'fixed top-0 left-0',
                isOpen ? 'translate-x-0' : '-translate-x-full',
                'flex flex-col',
                'w-64'
              ]
            : [
                'flex flex-col sticky top-0'
              ]
        )}
        style={
          isMobile
            ? undefined
            : { width: showElement ? '16rem' : '3.5rem', transitionProperty: 'width' }
        }
      >
        {/* Header */}
        <div className="w-full h-16 border-b border-sidebar-border p-2 flex justify-center items-center bg-white relative">
          {isMobile ? (
            <img src="/DMVLOGO.svg" alt="Logo" className="h-full" draggable={false} />
          ) : (
            showElement ? (
              <img src="/DMVLOGOHORZ.svg" alt="Logo" className="h-full" draggable={false} />
            ) : (
              <img src="/DMVLOGO.svg" alt="Logo" className="h-full" draggable={false} />
            )
          )}
        </div>

        {/* Vertically centered sidebar toggle button (desktop only) */}
        {!isMobile && (
          <button
            onClick={toggleElement}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-gray-50 border border-gray-300 shadow rounded-sm flex items-center justify-center z-50 hover:bg-blue-50"
            style={{ marginRight: '-12px' }}
            aria-label={showElement ? 'Hide Details' : 'Show Details'}
          >
            {showElement ? <SidebarClose size={10} /> : <SidebarOpen size={10} />}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative flex">
          <SidebarNavRail />
          {(isMobile || showElement) && element}
        </div>
      </div>
    </>
  )
}
