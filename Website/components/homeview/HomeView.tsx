'use client'

import { useEffect } from 'react';
import { AppSidebar } from '../shared/AppSidebar'
import { useSidebarDispatch } from '@/contexts/SidebarContext'

interface IHomeViewProps { }

export const HomeView = ({ }: IHomeViewProps) => {

    const dispatch = useSidebarDispatch()
    
    useEffect(() => {
        dispatch({ type: 'SET_ELEMENT', payload: <></> });
    }, []);

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
    
            <div className="flex-1 bg-stone-50 overflow-auto">
            </div>
        </div>
    )
}
