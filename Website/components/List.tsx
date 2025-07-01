import { Groups } from "../generated/Data"
import { Group } from "./Group"

interface IListProps {

}

export const List = ({ }: IListProps) => {
    return <>
        {Groups.map((group) =>
            <Group
                key={group.Name}
                group={group} />
        )}
    </>
}
