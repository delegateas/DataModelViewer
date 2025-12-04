import { Box } from "@mui/material";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
}

const CustomTabPanel = (props: TabPanelProps) => {
    const { children, value, index, className, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            className={className}
            {...other}
        >
            <Box sx={{ p: 0, display: value === index ? 'block' : 'none' }}>{children}</Box>
        </div>
    );
}

export default CustomTabPanel;