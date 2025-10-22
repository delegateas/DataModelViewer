import { useDiagramView } from "@/contexts/DiagramViewContext";
import { EntityType } from "@/lib/Types";
import { Box, Button, Divider, Typography } from "@mui/material";

interface ISelectionPropertiesProps {
    selectedEntities: EntityType[];
}

export const SelectionProperties = ({ selectedEntities }: ISelectionPropertiesProps) => {
    const { applySmartLayout, getSelectedEntities } = useDiagramView();

    // Get the current selected entities from the context
    const currentlySelectedEntities = getSelectedEntities();
    
    // Use the current selection if available, otherwise fall back to the prop
    const entitiesToShow = currentlySelectedEntities.length > 0 ? currentlySelectedEntities : selectedEntities;

    const handleSmartLayout = () => {
        if (entitiesToShow.length > 0) {
            applySmartLayout(entitiesToShow);
        }
    };

    return (
        <Box className="flex flex-col" gap={2}>
            <Typography variant="h6" className='self-center'>
                {entitiesToShow.length > 0 
                    ? entitiesToShow.map(e => e.SchemaName).join(", ") 
                    : "No Entities Selected"
                }
            </Typography>
            <Divider />
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSmartLayout}
                disabled={entitiesToShow.length === 0}
            >
                Smart Layout ({entitiesToShow.length} entities)
            </Button>
        </Box>
    );
};