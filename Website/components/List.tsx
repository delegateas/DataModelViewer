import Group from "../components/Group"
import { Groups } from "../generated/Data"

function List({ selected, onSelect }: { selected: string | null, onSelect: (entity: string) => void }) {
    return <>
        {Groups.map((group) =>
            <Group
                key={group.Name}
                group={group}
                selected={selected}
                onSelect={onSelect} />
        )}
    </>
}

export default List
