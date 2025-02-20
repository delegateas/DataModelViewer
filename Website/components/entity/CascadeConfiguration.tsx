'use client'

import { CascadeConfigurationType, CascadeType } from "@/lib/Types";

export function CascadeConfiguration({ config }: { config: CascadeConfigurationType | null }): JSX.Element {
    if (!config) {
        return <span>None</span>
    }

    if (isReferential(config)) {
        return <span>Referential</span>
    }
    
    if (isReferentialRestrictDelete(config)) {
        return <span>Referential, Restrict Delete</span>
    }

    if (isParential(config)) {
        return <span>Parential</span>
    }

    return (
        <div className="grid grid-cols-[auto_1fr] gap-x-2 whitespace-nowrap">
            <span>Assign:</span>
            <span>{CascadeType[config.Assign]}</span>
            <span>Reparent:</span>
            <span>{CascadeType[config.Reparent]}</span>
            <span>Delete:</span>
            <span>{CascadeType[config.Delete]}</span>
            <span>Share:</span>
            <span>{CascadeType[config.Share]}</span>
            <span>Unshare:</span>
            <span>{CascadeType[config.Unshare]}</span>
            <span>Merge:</span>
            <span>{CascadeType[config.Merge]}</span>
        </div>
    )
}

function isReferential(config: CascadeConfigurationType): boolean {
    return config.Assign === CascadeType.None &&
        config.Delete === CascadeType.RemoveLink &&
        config.Merge === CascadeType.None &&
        config.Reparent === CascadeType.None &&
        config.Share === CascadeType.None &&
        config.Unshare === CascadeType.None;
}

function isReferentialRestrictDelete(config: CascadeConfigurationType): boolean {
    return config.Assign === CascadeType.None &&
        config.Delete === CascadeType.Restrict &&
        config.Merge === CascadeType.None &&
        config.Reparent === CascadeType.None &&
        config.Share === CascadeType.None &&
        config.Unshare === CascadeType.None;
}

function isParential(config: CascadeConfigurationType): boolean {
    return config.Assign === CascadeType.Cascade &&
        config.Delete === CascadeType.Cascade &&
        config.Merge === CascadeType.None &&
        config.Reparent === CascadeType.Cascade &&
        config.Share === CascadeType.Cascade &&
        config.Unshare === CascadeType.Cascade;
}