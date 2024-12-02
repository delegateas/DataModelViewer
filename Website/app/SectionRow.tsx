function SectionRow({displayName, schemaName, type, description} : {displayName: string, schemaName: string, type: string, description: string}) {
    return <>
        <p className="py-2 border-b-2">{displayName}</p>
        <p className="py-2 border-b-2">{schemaName}</p>
        <p className="py-2 border-b-2">{type}</p>
        <p className="py-2 border-b-2">{description}</p>
        </>
}

export default SectionRow;