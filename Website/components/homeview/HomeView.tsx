'use client'

import { useEffect, useState } from 'react';
import { AppSidebar } from '../shared/AppSidebar'
import { useSidebarDispatch } from '@/contexts/SidebarContext'
import Markdown from 'react-markdown'

interface IHomeViewProps { }

export const HomeView = ({ }: IHomeViewProps) => {

    const dispatch = useSidebarDispatch();

    const [wikipage, setWikipage] = useState<string>('');

    useEffect(() => {
        dispatch({ type: 'SET_ELEMENT', payload: <></> });
        dispatch({ type: 'SET_SHOW_ELEMENT', payload: false });
        fetch('/api/markdown')
            .then(res => res.json())
            .then(data => setWikipage(data.fileContent.replace(/\\n/g, '\n')));
    }, []);

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
    
            <div className="flex-1 bg-stone-50 overflow-auto p-16">
                <div className='rounded-lg border bg-white shadow-md p-6 flex items-center justify-between mb-8'>
                    <div className="flex-1">
                        <h4 className='text-3xl font-bold mb-3 text-gray-800'>
                            Welcome back! 🎉<br />
                            <span className="text-indigo-600">Data Explorer</span>
                        </h4>
                        <p className='text-gray-600 mb-4 text-base'>
                            Your datamodel is ready to explore. Dive into entities, relationships, and insights.
                        </p>
                        <button className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm'>
                            Explore Now
                        </button>
                    </div>
                    <div className="flex-shrink-0 ml-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-20 h-20 text-indigo-500" viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" opacity="0.6" d="M216.3 138v108.3c0 2.2-1.8 4-4 4H195c-2.2 0-4-1.8-4-4V138c0-2.2 1.8-4 4-4h17.3c2.2 0 4 1.8 4 4zm-55-68H144c-2.2 0-4 1.8-4 4v176.3c0 2.2 1.8 4 4 4h17.3c2.2 0 4-1.8 4-4V74c0-2.2-1.8-4-4-4zm102 93H246c-2.2 0-4 1.8-4 4v75.7c0 2.2 1.8 4 4 4h17.3c2.2 0 4-1.8 4-4V167c0-2.2-1.8-4-4-4z"/>
                                <path fill="currentColor" opacity="0.4" d="M359.2 253.4c-1.1 3.1-2.3 6.3-3.7 9.7-5.1.1-10.1.3-15.2.4-3.3.1-6.9.2-9.6 2.1-5.2 3.6-.7 6.1-1.3 9.6-.7 4.2-4.9 5.1-9 5.1-14.1.1-27.7 4.6-41.5 7.3s-28.9 3.5-41.2-3.4c-.8-.5-1.7-1-2-2-.6-1.6.9-3.2 2.3-4.2 3.2-2.2 6.7-3.7 10.5-4.5 2.2-.5 4.5-.8 6.5-2 1.9-1.2 3.3-3.7 2.3-5.8-32.1 2-64.1 4.8-96 8.4-41.1 4.8-81.8 12.9-123 15.9h-.4c-2.9-2.9-5.5-6-7.9-9.3.2-.2.4-.5.6-.7 2-2.2 5-3.2 7.8-4.1 15.9-4.9 32.4-7.4 48.8-9.9 81.6-12.3 164.2-21.1 246.8-15.3 8.4.6 16.8 1.5 25.2 2.7z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className='bg-white rounded-lg border border-gray-300 shadow-md p-6'>
                    {/* Add loading state */}
                    {wikipage ? (
                        <Markdown components={{
                            h1: ({ ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-3xl font-bold mb-4" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-2xl font-bold mb-4" {...props} />,
                            h4: ({ ...props }) => <h4 className="text-xl font-bold mb-4" {...props} />,
                            p: ({ ...props }) => <p className="mb-4" {...props} />,
                            a: ({ ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                            li: ({ ...props }) => <li className="ml-6 list-disc" {...props} />,
                            span: ({ ...props }) => <span className="font-semibold" {...props} />,
                            img: ({ ...props }) => <img className="max-w-full h-auto my-4" {...props} />,
                        }}>{wikipage}</Markdown>
                    ) : (   
                        <div>Loading wiki...</div>
                    )}
                </div>
            </div>
        </div>
    )
}
