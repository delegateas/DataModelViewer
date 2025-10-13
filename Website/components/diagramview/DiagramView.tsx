'use client';

import { useSidebar } from "@/contexts/SidebarContext";
import React, { useEffect } from "react";
import { SidebarDiagramView } from "./SidebarDiagramView";
import DiagramContainer from "./DiagramContainer";

interface IDiagramViewProps {

}

export default function DiagramView({ }: IDiagramViewProps) {
    const { setElement, expand } = useSidebar();

    useEffect(() => {
        setElement(<SidebarDiagramView />);
        expand();
    }, [])

    return (
        <DiagramContainer />
    );
}