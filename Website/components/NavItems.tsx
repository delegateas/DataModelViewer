import NavItem from './NavItem';
import { Groups } from "../generated/Data"
function NavItems({ selected, onSelect }: { selected: string | null, onSelect: (entity: string) => void }) {
    return <> 
        {Groups.map((group) => 
            <NavItem key={group.Name} group={group} selected={selected} onSelect={onSelect} />
        )}
        </>;
}

export default NavItems
