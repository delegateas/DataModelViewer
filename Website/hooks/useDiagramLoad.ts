import { useState } from 'react';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { DiagramDeserializationService, DiagramFile } from '@/lib/diagram/services/diagram-deserialization';

export const useDiagramLoad = () => {
    const { getGraph, setZoom, setTranslate, setLoadedDiagram } = useDiagramView();
    const [isLoading, setIsLoading] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [availableDiagrams, setAvailableDiagrams] = useState<DiagramFile[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);

    const loadAvailableDiagrams = async () => {
        setIsLoadingList(true);
        try {
            const diagrams = await DiagramDeserializationService.getAvailableDiagrams();
            setAvailableDiagrams(diagrams);
        } catch (error) {
            console.error('Error loading diagram list:', error);
            // TODO: Show error notification to user
            alert(`Failed to load diagram list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingList(false);
        }
    };

    const loadDiagramFromCloud = async (filePath: string) => {
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const diagramData = await DiagramDeserializationService.loadDiagramFromCloud(filePath);
            const graph = getGraph();
            
            DiagramDeserializationService.deserializeDiagram(
                diagramData,
                graph,
                setZoom,
                setTranslate,
                setLoadedDiagram,
                diagramData.name || 'Untitled',
                'cloud',
                filePath // Pass the filePath for cloud diagrams
            );
            
            console.log('Diagram loaded successfully from cloud:', diagramData.name);
            
            // TODO: Show success notification to user
            alert(`Diagram "${diagramData.name}" loaded successfully`);
            
            setShowLoadModal(false);
            
        } catch (error) {
            console.error('Error loading diagram from cloud:', error);
            // TODO: Show error notification to user
            alert(`Failed to load diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDiagramFromFile = async (file: File) => {
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const diagramData = await DiagramDeserializationService.loadDiagramFromFile(file);
            const graph = getGraph();
            
            DiagramDeserializationService.deserializeDiagram(
                diagramData,
                graph,
                setZoom,
                setTranslate,
                setLoadedDiagram,
                file.name.replace('.json', ''),
                'file',
                undefined // No filePath for local files
            );
            
            console.log('Diagram loaded successfully from file:', diagramData.name);
            
            // TODO: Show success notification to user
            alert(`Diagram "${diagramData.name}" loaded successfully from file`);
            
        } catch (error) {
            console.error('Error loading diagram from file:', error);
            // TODO: Show error notification to user
            alert(`Failed to load diagram from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const openLoadModal = () => {
        setShowLoadModal(true);
        loadAvailableDiagrams();
    };

    const closeLoadModal = () => {
        setShowLoadModal(false);
    };

    return {
        isLoading,
        isLoadingList,
        showLoadModal,
        availableDiagrams,
        loadDiagramFromCloud,
        loadDiagramFromFile,
        openLoadModal,
        closeLoadModal
    };
};