'use client'

import React, { useEffect, useState } from 'react';
import { AppSidebar } from '../shared/AppSidebar'
import { useSidebarDispatch } from '@/contexts/SidebarContext'
import { SolutionOverview } from '@/generated/Data'
import { SolutionComponentType } from '@/lib/Types'
import { SolutionVennDiagram } from './SolutionVennDiagram'
import { ComponentDetailsPane } from './ComponentDetailsPane'

interface ISolutionOverviewViewProps { }

export const SolutionOverviewView = ({}: ISolutionOverviewViewProps) => {
    const dispatch = useSidebarDispatch();
    const [selectedOverlap, setSelectedOverlap] = useState<{
        solutionNames: string[];
        components: SolutionComponentType[];
    } | null>(null);

    useEffect(() => {
        dispatch({ type: 'SET_ELEMENT', payload: <></> });
        dispatch({ type: 'SET_SHOW_ELEMENT', payload: false });
    }, [dispatch]);

    const handleOverlapClick = (solutionNames: string[], components: SolutionComponentType[]) => {
        setSelectedOverlap({ solutionNames, components });
    };

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
    
            <div className="flex-1 bg-stone-50 overflow-auto p-6">
                <div className='rounded-lg border bg-white shadow-md p-4 flex flex-wrap mb-8 items-center justify-center'>
                    <h1 className='text-2xl font-bold'>Solution Overview</h1>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Venn Diagram Section */}
                    <div className='bg-white rounded-lg border border-gray-300 shadow-md p-6'>
                        <h2 className="text-xl font-semibold mb-4">Solution Component Overlaps</h2>
                        {SolutionOverview && SolutionOverview.Solutions.length > 0 ? (
                            <SolutionVennDiagram 
                                solutionOverview={SolutionOverview} 
                                onOverlapClick={handleOverlapClick}
                            />
                        ) : (
                            <div className="text-gray-500 text-center py-8">
                                No solution data available. Please run the generator with multiple solutions configured.
                            </div>
                        )}
                    </div>

                    {/* Component Details Section */}
                    <div className='bg-white rounded-lg border border-gray-300 shadow-md p-6'>
                        <h2 className="text-xl font-semibold mb-4">Component Details</h2>
                        {selectedOverlap ? (
                            <ComponentDetailsPane 
                                solutionNames={selectedOverlap.solutionNames}
                                components={selectedOverlap.components}
                            />
                        ) : (
                            <div className="text-gray-500 text-center py-8">
                                Click on a section in the diagram to view component details.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}