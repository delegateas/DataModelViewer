'use client'

import React from 'react';
import { SolutionComponentType } from '@/lib/Types';

interface IComponentDetailsPaneProps {
    solutionNames: string[];
    components: SolutionComponentType[];
}

export const ComponentDetailsPane = ({ solutionNames, components }: IComponentDetailsPaneProps) => {
    const groupedComponents = components.reduce((acc, component) => {
        const type = component.ComponentTypeName || 'Unknown';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(component);
        return acc;
    }, {} as Record<string, SolutionComponentType[]>);

    const getComponentTypeIcon = (componentType: string) => {
        switch (componentType) {
            case 'Entity':
                return '🗂️';
            case 'Attribute':
                return '📝';
            case 'Security Role':
                return '🔐';
            case 'Plugin Step':
                return '⚙️';
            default:
                return '❓';
        }
    };

    const getComponentTypeColor = (componentType: string) => {
        switch (componentType) {
            case 'Entity':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Attribute':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Security Role':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Plugin Step':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with solution names */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                    {solutionNames.length === 1 ? 'Solution' : 'Solutions'}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {solutionNames.map((name, index) => (
                        <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {name}
                        </span>
                    ))}
                </div>
                <div className="mt-2 text-sm text-blue-700">
                    Total: {components.length} component{components.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Component types summary */}
            <div className="grid grid-cols-2 gap-3">
                {Object.entries(groupedComponents).map(([type, comps]) => (
                    <div key={type} className={`p-3 rounded-lg border ${getComponentTypeColor(type)}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getComponentTypeIcon(type)}</span>
                            <span className="font-medium text-sm">{type}</span>
                        </div>
                        <div className="text-sm font-semibold">{comps.length}</div>
                    </div>
                ))}
            </div>

            {/* Detailed component list */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(groupedComponents).map(([type, comps]) => (
                    <div key={type} className="border rounded-lg">
                        <div className={`px-4 py-2 rounded-t-lg ${getComponentTypeColor(type)} border-b`}>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{getComponentTypeIcon(type)}</span>
                                <span className="font-semibold">{type} ({comps.length})</span>
                            </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                            {comps.map((component, index) => (
                                <div 
                                    key={index}
                                    className="px-4 py-2 border-b last:border-b-0 hover:bg-gray-50"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">
                                                {component.ComponentDisplayName || 'Unnamed Component'}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">
                                                ID: {component.ObjectId}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">
                                                Type: {component.ComponentType}
                                            </div>
                                            {component.RootComponentBehavior !== -1 && (
                                                <div className="text-xs text-gray-500">
                                                    Behavior: {component.RootComponentBehavior}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};