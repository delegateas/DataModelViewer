'use client'

import { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext'
import Markdown from 'react-markdown'
import { Box, Button, CircularProgress, Grid, IconButton, Paper, Typography } from '@mui/material';
import NotchedBox from '@/components/shared/elements/NotchedBox';
import Carousel, { CarouselItem } from '@/components/shared/elements/Carousel';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface IHomeViewProps { }

export const HomeView = ({ }: IHomeViewProps) => {

    const { setElement, close } = useSidebar();

    const router = useRouter();

    const [wikipage, setWikipage] = useState<string | undefined>('');
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

    // Carousel data
    const carouselItems: CarouselItem[] = [
        {
            image: '/processes.jpg',
            title: 'Implicit data!',
            text: "Now you can see the implicit components automatically added by the Platform (hidden in the solution components). And while we were at it, we also chose to display the dependent classical workflows and business rules that the Platform makes visible to you. Don't forget to check out the Insights for new additional dashboards.",
            type: '(v2.2.6) Patch update',
            action: () => router.push('/processes')
        },
        {
            image: '/documentation.jpg',
            title: 'Connect to your Azure DevOps!',
            text: 'The diagram tool is the first to take advantage of the new integration. Save and load your diagrams directly from your Azure DevOps repository to keep version control on your diagrams. Check out the documentation to get started.',
            type: '(v2.2.0) Feature',
            actionlabel: 'Go to Diagrams',
            action: () => router.push('/diagram')
        },
        {
            image: '/insights.jpg',
            title: 'Insights are here!',
            text: "Get insights into your solutions, entities and attributes with the new Insights feature. Analyze your solutions' relationships and shared components to optimize your environment. See bad practices and get recommendations to improve your data model.",
            type: '(v2.1.0) Feature Release',
            actionlabel: 'Go to Insights',
            action: () => router.push('/insights')
        },
        {
            image: '/processes.jpg',
            title: 'Webresource support!',
            text: "View your attributes used inside your JS webresources in the Processes Explorer. Now supports the getAttribute method with more to come soon.",
            type: '(v2.0.1) Feature update',
            actionlabel: 'Try it out',
            action: () => router.push('/processes')
        },
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
            .then(res => {
                return res.json();
            })
            .then(data => {
                if (data.fileContent) {
                    setWikipage(data.fileContent.replace(/\\n/g, '\n'));
                } else {
                    setWikipage(undefined);
                }
            })
            .catch(error => {
                console.error('Error fetching wiki page:', error);
                setWikipage(undefined);
            });
    }, []);

    return (
        <Box style={{ height: 'calc(100vh - var(--layout-header-desktop-height))' }}>
            <Grid container spacing={2} className="p-4">
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
                                    <ChevronLeftRounded />
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
                    {
                        wikipage !== undefined && (
                            <Paper elevation={2} className='rounded-2xl p-8'>
                                {wikipage.length > 0 ? (
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
                                    <Typography variant='body1' className="flex w-full items-center justify-center"><CircularProgress size={16} color='primary' className="mr-2" /> Loading wiki page...</Typography>
                                )}
                            </Paper>
                        )
                    }
                </Grid>
            </Grid>
        </Box>
    )
}
