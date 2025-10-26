import { useState } from 'react';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { DiagramPngExportService } from '@/lib/diagram/services/diagram-png-export';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { ExportOptions } from '@/components/diagramview/modals/ExportOptionsModal';

type ExportTarget = 'local' | 'cloud' | null;

export const useDiagramExport = () => {
    const { canvas, diagramName } = useDiagramView();
    const [isExporting, setIsExporting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportTarget, setExportTarget] = useState<ExportTarget>(null);
    const { showSnackbar } = useSnackbar();

    const openExportModal = (target: ExportTarget) => {
        setExportTarget(target);
        setShowExportModal(true);
    };

    const closeExportModal = () => {
        setShowExportModal(false);
        setExportTarget(null);
    };

    const performExport = async (options: ExportOptions) => {
        if (isExporting || !canvas.current || !exportTarget) {
            console.warn('Export already in progress, canvas not available, or no target set');
            return;
        }

        setIsExporting(true);

        try {
            // Get the canvas element
            const canvasElement = canvas.current;

            // Export to PNG data URL with options
            showSnackbar('Generating PNG...', 'info');
            const dataUrl = await DiagramPngExportService.exportToPng(canvasElement, {
                backgroundColor: options.includeGrid ? '#ffffff' : null,
                scale: 2,
                includeGrid: options.includeGrid,
            });

            if (exportTarget === 'local') {
                // Download the PNG
                const fileName = DiagramPngExportService.downloadPng(dataUrl, diagramName || 'diagram');
                showSnackbar(`Downloaded ${fileName} successfully`, 'success');
            } else if (exportTarget === 'cloud') {
                // Upload to cloud
                showSnackbar('Uploading to cloud...', 'info');
                const result = await DiagramPngExportService.uploadPngToCloud(dataUrl, diagramName || 'diagram');

                if (result.success) {
                    showSnackbar(`Exported ${diagramName || 'diagram'}.png to cloud successfully`, 'success');
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            }
        } catch (error) {
            console.error('Error exporting diagram as PNG:', error);
            showSnackbar(`Failed to export diagram ${exportTarget === 'cloud' ? 'to cloud' : 'locally'}`, 'error');
        } finally {
            setIsExporting(false);
            setExportTarget(null);
        }
    };

    const exportDiagramLocallyAsPng = () => {
        openExportModal('local');
    };

    const exportDiagramToCloudAsPng = () => {
        openExportModal('cloud');
    };

    return {
        isExporting,
        showExportModal,
        exportTarget,
        exportDiagramLocallyAsPng,
        exportDiagramToCloudAsPng,
        performExport,
        closeExportModal,
    };
};
