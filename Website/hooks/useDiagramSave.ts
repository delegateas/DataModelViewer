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
        } catch (error) {
            console.error('Error saving diagram:', error);
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