'use client'

import { useEffect, useState } from 'react';
import { AppSidebar } from '../shared/AppSidebar'
import { useSidebarDispatch } from '@/contexts/SidebarContext'
import Markdown from 'react-markdown'
import { Button } from '../shared/ui/button';
import { Database } from 'lucide-react';
import { Label } from '../shared/ui/label';

interface IHomeViewProps { }

export const HomeView = ({ }: IHomeViewProps) => {

    const dispatch = useSidebarDispatch();

    const [wikipage, setWikipage] = useState<string>('');

    useEffect(() => {
        dispatch({ type: 'SET_ELEMENT', payload: <></> });
        dispatch({ type: 'SET_SHOW_ELEMENT', payload: false });
        fetch('/api/markdown')
            .then(res => res.json())
            .then(data => setWikipage(data.fileContent));
    }, []);

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
    
            <div className="flex-1 bg-stone-50 overflow-auto p-16">
                <div className='rounded-lg border bg-white shadow-md p-4 flex flex-wrap mb-8 items-center justify-center'>
                    <h1 className='text-2xl font-bold'>Welcome back to your datamodel!</h1>
                </div>
                <div className='bg-white rounded-lg border border-gray-300 shadow-md p-6'>
                    {/* Add loading state */}
                    {wikipage ? (
                        <Markdown components={{
                            h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mb-4" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mb-4" {...props} />,
                            h4: ({ node, ...props }) => <h4 className="text-xl font-bold mb-4" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                            a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                            li: ({ node, ...props }) => <li className="ml-6 list-disc" {...props} />,
                            span: ({ node, ...props }) => <span className="font-semibold" {...props} />,
                        }}>{wikipage}</Markdown>
                    ) : (   
                        <div>Loading wiki...</div>
                    )}
                </div>
            </div>
        </div>
    )
}
