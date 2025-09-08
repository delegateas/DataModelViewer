'use client'

import React, { useEffect, useState } from 'react';
import { AppSidebar } from '../shared/AppSidebar'
import { useSidebarDispatch } from '@/contexts/SidebarContext'
import { SolutionOverview } from '@/generated/Data'
import { SolutionComponentType } from '@/lib/Types'
import { SolutionVennDiagram } from './SolutionVennDiagram'
import { ComponentDetailsPane } from './ComponentDetailsPane'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/shared/ui/sheet'

interface ISolutionOverviewViewProps { }

export const SolutionOverviewView = ({}: ISolutionOverviewViewProps) => {
    const dispatch = useSidebarDispatch();
    const [selectedOverlap, setSelectedOverlap] = useState<{
        solutionNames: string[];
        components: SolutionComponentType[];
    } | null>(null);
    const [isDetailsPaneOpen, setIsDetailsPaneOpen] = useState(false);

    useEffect(() => {
        dispatch({ type: 'SET_ELEMENT', payload: <></> });
        dispatch({ type: 'SET_SHOW_ELEMENT', payload: false });
    }, [dispatch]);

    const handleOverlapClick = (solutionNames: string[], components: SolutionComponentType[]) => {
        setSelectedOverlap({ solutionNames, components });
        setIsDetailsPaneOpen(true);
    };

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
    
            <div className="flex-1 bg-stone-50 overflow-auto p-6">
                <div className='rounded-lg border bg-white shadow-md p-4 flex flex-wrap mb-8 items-center justify-center'>
                    <h1 className='text-2xl font-bold'>Solution Overview</h1>
                </div>
                
                {/* Full width Venn Diagram Section */}
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
                    
                    {SolutionOverview && SolutionOverview.Solutions.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600 text-center">
                            Click on any section of the diagram to view detailed component information
                        </div>
                    )}
                </div>

                {/* Component Details Flyout */}
                <Sheet open={isDetailsPaneOpen} onOpenChange={setIsDetailsPaneOpen}>
                    <SheetContent side="right" className="w-96 overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Component Details</SheetTitle>
                        </SheetHeader>
                        
                        {selectedOverlap && (
                            <div className="mt-6">
                                <ComponentDetailsPane 
                                    solutionNames={selectedOverlap.solutionNames}
                                    components={selectedOverlap.components}
                                />
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}