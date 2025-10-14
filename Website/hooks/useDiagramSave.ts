import { useState } from 'react';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { DiagramSerializationService } from '@/lib/diagram-serialization';

export const useDiagramSave = () => {
    const { getGraph, zoom, translate } = useDiagramView();
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const saveDiagram = async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        setShowSaveModal(true);
        
        try {
            const graph = getGraph();
            const diagramData = DiagramSerializationService.serializeDiagram(graph, zoom, translate);
            const result = await DiagramSerializationService.saveDiagram(diagramData);
            
            console.log('Diagram saved successfully:', result);
            
            // TODO: Show success notification to user
            alert(`Diagram saved successfully as ${result.fileName}`);
            
        } catch (error) {
            console.error('Error saving diagram:', error);
            // TODO: Show error notification to user
            alert(`Failed to save diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
            setShowSaveModal(false);
        }
    };

    const closeSaveModal = () => {
        setShowSaveModal(false);
    };

    return {
        isSaving,
        showSaveModal,
        saveDiagram,
        closeSaveModal
    };
};