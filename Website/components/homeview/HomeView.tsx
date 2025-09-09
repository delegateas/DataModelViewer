'use client'

import { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext'
import Markdown from 'react-markdown'
import { Box, Button, Grid, IconButton, Paper, Typography } from '@mui/material';
import NotchedBox from '@/components/shared/elements/NotchedBox';
import Carousel, { CarouselItem } from '@/components/shared/elements/Carousel';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface IHomeViewProps { }

export const HomeView = ({ }: IHomeViewProps) => {

    const { setElement, close } = useSidebar();

    const router = useRouter();

    const [wikipage, setWikipage] = useState<string>('');
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

    // Carousel data
    const carouselItems: CarouselItem[] = [
        {
            image: '/processes.jpg',
            title: 'Process Explorer!',
            text: "Work has started on the process explorer! This will be a place to figure out what processes are touching your fields. Everything from server- to client side.",
            type: '(v2.0.0) Alpha Feature',
            actionlabel: 'Try it out',
            action: () => router.push('/processes')
        },
        {
            image: '/upgrade.jpg',
            title: 'Data Model Viewer 2.0.0!',
            text: "The UI has been refreshed for an even cleaner, more modern look with enhanced functionality. And we've upgraded the tech stack to ensure easier maintainability.",
            type: '(v2.0.0) Announcement'
        },
        {
            image: '/documentation.jpg',
            title: 'Home WIKI ADO Page',
            text: 'Display your own wiki page from your ADO instance. Use it, to give your organisation a special introduction to DMV. Now also supports images!',
            type: '(v1.4.1) Feature',
            actionlabel: 'Read how',
            action: () => window.open("https://github.com/delegateas/DataModelViewer", '_blank')
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
                                <Typography variant='body1' className="text-md text-gray-300">Explore your metadata model with ease. If this is your first time using Data Model Viewer, make sure to check out the documentation on Git.</Typography>
                                <Button href='/metadata' size='small' variant='contained' color='primary' className='text-white py-2 mt-4 rounded-lg transition-colors shadow-sm w-32'>Explore Now</Button>
                            </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <NotchedBox 
                        notchContent={
                            <Box className="flex items-center gap-1 bg-transparent">
                                <IconButton size="medium" onClick={goToPrevious}>
                                    <ChevronLeftRounded/>
                                </IconButton>
                                <IconButton size="medium" onClick={goToNext}>
                                    <ChevronRightRounded />
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
}
