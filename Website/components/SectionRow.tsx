function SectionRow({
    displayName, 
    schemaName, 
    type, 
    description,
    className} 
    : {
        displayName: string, 
        schemaName: string, 
        type: string, 
        description: string,
        className?: string}) {
    return <div className={`grid grid-cols-4 ${className}`}>
        <p className="py-2 border-b-2">{displayName}</p>
        <p className="py-2 border-b-2">{schemaName}</p>
        <p className="py-2 border-b-2">{type}</p>
        <p className="py-2 border-b-2">{description}</p>
        </div>
}

export default SectionRow;