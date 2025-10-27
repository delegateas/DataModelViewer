import { useState } from 'react';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { DiagramSerializationService } from '@/lib/diagram/services/diagram-serialization';

export const useDiagramSave = () => {
    const { getGraph, zoom, translate, clearDiagram, setLoadedDiagram, loadedDiagramFilename, loadedDiagramSource, loadedDiagramFilePath, diagramName, getExcludedLinks } = useDiagramView();
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const saveDiagramToCloud = async () => {
        if (isSaving) return;

        setIsSaving(true);
        setShowSaveModal(true);

        try {
            const graph = getGraph();
            const excludedLinks = getExcludedLinks();
            const diagramData = DiagramSerializationService.serializeDiagram(graph, zoom, translate, diagramName, excludedLinks);

            // If we have a loaded diagram from cloud, preserve its name for overwriting
            if (loadedDiagramSource === 'cloud' && loadedDiagramFilename) {
                diagramData.name = loadedDiagramFilename;
            }

            // Use overwrite functionality if we have a cloud diagram loaded
            const overwriteFilePath = loadedDiagramSource === 'cloud' && loadedDiagramFilePath ? loadedDiagramFilePath : undefined;
            const result = await DiagramSerializationService.saveDiagram(diagramData, overwriteFilePath) as { filePath?: string };

            // Track that this diagram is now loaded from cloud with the correct file path
            const resultFilePath = result.filePath || overwriteFilePath;
            setLoadedDiagram(diagramData.name, 'cloud', resultFilePath);
        } catch (error) {
            console.error('Error saving diagram to cloud:', error);
        } finally {
            setIsSaving(false);
            setShowSaveModal(false);
        }
    };

    const saveDiagramLocally = () => {
        if (isSaving) return;

        setIsSaving(true);

        try {
            const graph = getGraph();
            const excludedLinks = getExcludedLinks();
            const diagramData = DiagramSerializationService.serializeDiagram(graph, zoom, translate, diagramName, excludedLinks);
            const downloadResult = DiagramSerializationService.downloadDiagramAsJson(diagramData);

            // Track that this diagram is now loaded as a file
            setLoadedDiagram(downloadResult.fileName, 'file');
        } catch (error) {
            console.error('Error saving diagram locally:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const closeSaveModal = () => {
        setShowSaveModal(false);
    };

    const createNewDiagram = () => {
        const graph = getGraph();
        if (graph) {
            graph.clear();
        }
        clearDiagram();
    };

    return {
        isSaving,
        showSaveModal,
        saveDiagramToCloud,
        saveDiagramLocally,
        closeSaveModal,
        createNewDiagram
    };
};