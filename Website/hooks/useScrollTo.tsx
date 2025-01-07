import { useEffect, useRef, useState } from "react";

export function useScrollTo<T extends Element>(): [React.RefObject<T>, (shouldScrollTo: boolean) => void] {
    const ref = useRef<T>(null);
    const [shouldScrollTo, setShouldScrollTo] = useState(false);

    useEffect(() => {
        if (ref.current && shouldScrollTo) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
            setShouldScrollTo(false);
        }
    }, [shouldScrollTo]);

    return [ref, setShouldScrollTo];
};