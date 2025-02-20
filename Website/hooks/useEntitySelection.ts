import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useEntitySelection() {
    const [selected, setSelected] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const entityParam = searchParams.get('selected');

    useEffect(() => {
        setSelected(entityParam);
    }, [entityParam]);

    return {
        selected,
        setSelected,
    };
}