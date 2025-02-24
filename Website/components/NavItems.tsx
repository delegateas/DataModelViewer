import NavItem from './NavItem';
import { Groups } from "../generated/Data"
import { useTouch } from './ui/hybridtooltop';
import { useSidebar } from './ui/sidebar';
function NavItems({ selected, onSelect }: { selected: string | null, onSelect: (entity: string) => void }) {
    const isTouch = useTouch();
    const { setOpen } = useSidebar();
    
    return <> 
        {Groups.map((group) => 
            <NavItem key={group.Name} group={group} selected={selected} onSelect={(entity) => {
                if (isTouch) {
                    setOpen(false);
                }
                onSelect(entity);
            }} />
        )}
        </>;
}

export default NavItems
