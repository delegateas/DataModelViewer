import { useState } from 'react';
import { useDiagramView, useDiagramViewDispatch } from '@/contexts/DiagramViewContext';
import { useDatamodelData } from '@/contexts/DatamodelDataContext';
import { DiagramDeserializationService, DiagramFile } from '@/lib/diagram/services/diagram-deserialization';
import { EntityType } from '@/lib/Types';

export const useDiagramLoad = () => {
    const { getGraph, applyZoomAndPan, setLoadedDiagram } = useDiagramView();
    const dispatch = useDiagramViewDispatch();
    const { getEntityDataBySchemaName } = useDatamodelData();
    const [isLoading, setIsLoading] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [availableDiagrams, setAvailableDiagrams] = useState<DiagramFile[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);

    const addEntityToDiagram = (entity: EntityType) => {
        dispatch({ type: 'ADD_ENTITY_TO_DIAGRAM', payload: entity });
    }

    const loadAvailableDiagrams = async () => {
        setIsLoadingList(true);
        try {
            const diagrams = await DiagramDeserializationService.getAvailableDiagrams();
            setAvailableDiagrams(diagrams);
        } catch (error) {
            console.error('Error loading diagram list:', error);
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
                getEntityDataBySchemaName,
                applyZoomAndPan,
                setLoadedDiagram,
                addEntityToDiagram,
                diagramData.name || 'Untitled',
                'cloud',
                filePath
            );

            setShowLoadModal(false);

        } catch (error) {
            console.error('Error loading diagram from cloud:', error);
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
                getEntityDataBySchemaName,
                applyZoomAndPan,
                setLoadedDiagram,
                addEntityToDiagram,
                file.name.replace('.json', ''),
                'file',
                undefined
            );
        } catch (error) {
            console.error('Error loading diagram from file:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openLoadModal = () => {
        setShowLoadModal(true);
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
        loadAvailableDiagrams,
        openLoadModal,
        closeLoadModal
    };
};