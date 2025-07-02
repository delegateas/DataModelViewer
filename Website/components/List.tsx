import { useEffect, useRef } from "react"
import { Groups } from "../generated/Data"
import { Group } from "./Group"
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext"

interface IListProps {

}

export const List = ({ }: IListProps) => {
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
    const { isScrolling } = useDatamodelView();
    const dispatch = useDatamodelViewDispatch();

    useEffect(() => {
        const sectionIds = Groups.flatMap(group => group.Entities.map(entity => entity.SchemaName));
        const refs = sectionIds.map(id => document.getElementById(id));
        refs.forEach((el, idx) => {
            sectionRefs.current[sectionIds[idx]] = el;
        });

        let ticking = false;
        let lastSection: string | null = null;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    let currentSection: string | null = null;
                    let currentGroup: string | null = null;
                    let minDistance = Infinity;
                    for (const id of sectionIds) {
                        const el = sectionRefs.current[id];
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            // Section top is above middle of viewport, but not too far above
                            const distance = Math.abs(rect.top - window.innerHeight / 6);
                            if (rect.top < window.innerHeight / 2 && distance < minDistance) {
                                minDistance = distance;
                                currentSection = id;
                                currentGroup = el.getAttribute('data-group')
                            }
                            if (distance > minDistance) break;
                        }
                    }
                    if (currentSection && currentSection !== lastSection) {
                        lastSection = currentSection;
                        dispatch({ type: 'SET_CURRENT_GROUP', payload: currentGroup });
                        dispatch({ type: 'SET_CURRENT_SECTION', payload: currentSection });
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [dispatch]);

    return <>
        {Groups.map((group) =>
            <Group
                key={group.Name}
                group={group} />
        )}
    </>
}
