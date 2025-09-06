'use client'

import { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext'
import Markdown from 'react-markdown'
import { Box, Button, Grid, IconButton, Paper, Typography } from '@mui/material';
import NotchedBox from '@/components/shared/elements/NotchedBox';
import Carousel, { CarouselItem } from '@/components/shared/elements/Carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface IHomeViewProps { }

export const HomeView = ({ }: IHomeViewProps) => {

    const { setElement, close } = useSidebar();

    const [wikipage, setWikipage] = useState<string>('');
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

    // Carousel data
    const carouselItems: CarouselItem[] = [
        {
            image: '/DMV2.png',
            title: 'Data Model Viewer 2.0.0!',
            text: "The UI has been refreshed for an even cleaner, more modern look with enhanced functionality. And we've upgraded the tech stack to ensure easier maintainability.",
            type: '(v2.0.0) Announcement'
        },
        {
            image: '/DMV3.png',
            title: 'Home WIKI ADO Page',
            text: 'Display your own wiki page from your ADO, to introduce your data. Now also supports images!',
            type: '(v1.4.1) Feature'
        },
        {
            title: 'Getting Started',
            text: 'New to Data Model Viewer? Check out our comprehensive documentation and tutorials to get up to speed quickly.',
            type: '(v1.0.0) Guide'
        }
    ];

    const goToPrevious = () => {
        setSlideDirection('left');
        setCurrentCarouselIndex((prevIndex) => 
            prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setSlideDirection('right');
        setCurrentCarouselIndex((prevIndex) => 
            prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
        );
    };

    useEffect(() => {
        setElement(null);
        close();
        fetch('/api/markdown')
            .then(res => res.json())
            .then(data => setWikipage(data.fileContent.replace(/\\n/g, '\n')));
    }, []);

    return (
        <Box className="min-h-screen p-4">
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box 
                        className='rounded-2xl flex w-full h-96 bg-cover bg-center bg-no-repeat'
                        sx={{
                            backgroundImage: `
                                linear-gradient(to right, rgba(17, 24, 39, 0.35) 0%, rgba(17, 24, 39, 0.85) 75%), 
                                url(/welcomeback-data-stockimage.webp)
                            `
                        }}>
                            <Box className="relative z-10 flex flex-col justify-center h-full p-8 text-white md:w-1/2 w-full">
                                <Typography variant='h1' className="text-4xl font-bold mb-4">Welcome back!</Typography>
                                <Typography variant='body1' className="text-md text-gray-300">Explore your data with ease. If this is your first time using Data Model Viewer, make sure to check out the documentation.</Typography>
                                <Button href='/metadata' size='small' variant='contained' color='primary' className='text-white py-2 mt-4 rounded-lg font-medium transition-colors shadow-sm w-32'>Explore Now</Button>
                            </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <NotchedBox 
                        notchContent={
                            <Box className="flex items-center gap-1 bg-transparent">
                                <IconButton size="medium" onClick={goToPrevious}>
                                    <ChevronLeft size={16} />
                                </IconButton>
                                <IconButton size="medium" onClick={goToNext}>
                                    <ChevronRight size={16} />
                                </IconButton>
                            </Box>
                        }
                        backgroundImage={carouselItems[currentCarouselIndex]?.image}
                        className='h-96'
                    >
                        <Carousel 
                            items={carouselItems}
                            currentIndex={currentCarouselIndex}
                            slideDirection={slideDirection}
                            className='w-full h-full'
                        />
                    </NotchedBox>
                </Grid>
                <Grid size={12}>
                    <Paper elevation={2} className='rounded-2xl p-8'>
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
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )

    return (
        <div className="flex min-h-screen">
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
