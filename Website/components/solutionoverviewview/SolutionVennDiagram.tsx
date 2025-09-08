'use client'

import React from 'react';
import { SolutionOverviewType, SolutionComponentType } from '@/lib/Types';

interface ISolutionVennDiagramProps {
    solutionOverview: SolutionOverviewType;
    onOverlapClick: (solutionNames: string[], components: SolutionComponentType[]) => void;
}

export const SolutionVennDiagram = ({ solutionOverview, onOverlapClick }: ISolutionVennDiagramProps) => {
    const solutions = solutionOverview.Solutions;
    const overlaps = solutionOverview.Overlaps;
    
    // Color palette for different sections
    const colors = [
        '#3B82F6', // blue
        '#EF4444', // red
        '#10B981', // green
        '#F59E0B', // yellow
        '#8B5CF6', // purple
        '#F97316', // orange
        '#06B6D4', // cyan
        '#EC4899', // pink
    ];

    // Helper function to get component type summary as array for vertical display
    const getComponentTypeSummary = (components: SolutionComponentType[]) => {
        const typeCounts = components.reduce((acc, component) => {
            const type = component.ComponentTypeName || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(typeCounts)
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`);
    };

    // For simplicity, we'll render based on the number of solutions
    if (solutions.length === 1) {
        return renderSingleSolution();
    } else if (solutions.length === 2) {
        return renderTwoSolutions();
    } else if (solutions.length === 3) {
        return renderThreeSolutions();
    } else {
        return renderMultipleSolutions();
    }

    function renderSingleSolution() {
        const solution = solutions[0];
        const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution.UniqueName);
        const typeSummary = overlap ? getComponentTypeSummary(overlap.SharedComponents) : [];
        
        return (
            <div className="flex items-center justify-center h-80">
                <svg width="400" height="300" viewBox="0 0 400 300">
                    <circle
                        cx="200"
                        cy="150"
                        r="120"
                        fill={colors[0]}
                        fillOpacity="0.6"
                        stroke={colors[0]}
                        strokeWidth="3"
                        className="cursor-pointer hover:fillOpacity-0.8"
                        onClick={() => overlap && onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                    />
                    <text x="200" y="130" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-lg">
                        {solution.DisplayName}
                    </text>
                    <text x="200" y="150" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm font-semibold">
                        {overlap?.ComponentCount || 0} components
                    </text>
                    {typeSummary.map((typeText, index) => (
                        <text 
                            key={index}
                            x="200" 
                            y={165 + index * 12} 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            className="fill-white text-xs"
                        >
                            {typeText}
                        </text>
                    ))}
                </svg>
            </div>
        );
    }

    function renderTwoSolutions() {
        const [solution1, solution2] = solutions;
        const overlap1 = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution1.UniqueName);
        const overlap2 = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution2.UniqueName);
        const overlapBoth = overlaps.find(o => o.SolutionNames.length === 2);

        const typeSummary1 = overlap1 ? getComponentTypeSummary(overlap1.SharedComponents) : [];
        const typeSummary2 = overlap2 ? getComponentTypeSummary(overlap2.SharedComponents) : [];
        const typeSummaryBoth = overlapBoth ? getComponentTypeSummary(overlapBoth.SharedComponents) : [];

        return (
            <div className="flex items-center justify-center h-80">
                <svg width="600" height="350" viewBox="0 0 600 350">
                    {/* Solution 1 Circle */}
                    <circle
                        cx="200"
                        cy="175"
                        r="120"
                        fill={colors[0]}
                        fillOpacity="0.6"
                        stroke={colors[0]}
                        strokeWidth="3"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => overlap1 && onOverlapClick(overlap1.SolutionNames, overlap1.SharedComponents)}
                    />
                    
                    {/* Solution 2 Circle */}
                    <circle
                        cx="400"
                        cy="175"
                        r="120"
                        fill={colors[1]}
                        fillOpacity="0.6"
                        stroke={colors[1]}
                        strokeWidth="3"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => overlap2 && onOverlapClick(overlap2.SolutionNames, overlap2.SharedComponents)}
                    />

                    {/* Overlap area - invisible clickable region */}
                    <ellipse
                        cx="300"
                        cy="175"
                        rx="60"
                        ry="90"
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => overlapBoth && onOverlapClick(overlapBoth.SolutionNames, overlapBoth.SharedComponents)}
                    />

                    {/* Solution 1 Labels */}
                    <text x="140" y="145" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-base">
                        {solution1.DisplayName}
                    </text>
                    <text x="140" y="165" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm font-semibold">
                        {overlap1?.ComponentCount || 0} components
                    </text>
                    {typeSummary1.map((typeText, index) => (
                        <text 
                            key={index}
                            x="140" 
                            y={180 + index * 12} 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            className="fill-white text-xs"
                        >
                            {typeText}
                        </text>
                    ))}
                    
                    {/* Solution 2 Labels */}
                    <text x="460" y="145" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-base">
                        {solution2.DisplayName}
                    </text>
                    <text x="460" y="165" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm font-semibold">
                        {overlap2?.ComponentCount || 0} components
                    </text>
                    {typeSummary2.map((typeText, index) => (
                        <text 
                            key={index}
                            x="460" 
                            y={180 + index * 12} 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            className="fill-white text-xs"
                        >
                            {typeText}
                        </text>
                    ))}
                    
                    {/* Overlap Labels */}
                    <text x="300" y="155" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-base">
                        {overlapBoth?.ComponentCount || 0}
                    </text>
                    {typeSummaryBoth.map((typeText, index) => (
                        <text 
                            key={index}
                            x="300" 
                            y={175 + index * 12} 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            className="fill-white text-xs"
                        >
                            {typeText}
                        </text>
                    ))}
                </svg>
            </div>
        );
    }

    function renderThreeSolutions() {
        const [solution1, solution2, solution3] = solutions;
        
        return (
            <div className="flex items-center justify-center h-96">
                <svg width="500" height="400" viewBox="0 0 500 400">
                    {/* Solution 1 Circle (top) */}
                    <circle
                        cx="250"
                        cy="130"
                        r="100"
                        fill={colors[0]}
                        fillOpacity="0.6"
                        stroke={colors[0]}
                        strokeWidth="3"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                            const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution1.UniqueName);
                            if (overlap) onOverlapClick(overlap.SolutionNames, overlap.SharedComponents);
                        }}
                    />
                    
                    {/* Solution 2 Circle (bottom left) */}
                    <circle
                        cx="180"
                        cy="250"
                        r="100"
                        fill={colors[1]}
                        fillOpacity="0.6"
                        stroke={colors[1]}
                        strokeWidth="3"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                            const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution2.UniqueName);
                            if (overlap) onOverlapClick(overlap.SolutionNames, overlap.SharedComponents);
                        }}
                    />

                    {/* Solution 3 Circle (bottom right) */}
                    <circle
                        cx="320"
                        cy="250"
                        r="100"
                        fill={colors[2]}
                        fillOpacity="0.6"
                        stroke={colors[2]}
                        strokeWidth="3"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                            const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution3.UniqueName);
                            if (overlap) onOverlapClick(overlap.SolutionNames, overlap.SharedComponents);
                        }}
                    />

                    {/* Clickable regions for overlaps */}
                    {overlaps.map((overlap, index) => {
                        if (overlap.SolutionNames.length > 1) {
                            const centerX = overlap.SolutionNames.length === 2 ? 
                                (overlap.SolutionNames.includes(solution1.UniqueName) && overlap.SolutionNames.includes(solution2.UniqueName) ? 215 :
                                 overlap.SolutionNames.includes(solution1.UniqueName) && overlap.SolutionNames.includes(solution3.UniqueName) ? 285 : 250) :
                                250;
                            const centerY = overlap.SolutionNames.length === 2 ?
                                (overlap.SolutionNames.includes(solution2.UniqueName) && overlap.SolutionNames.includes(solution3.UniqueName) ? 250 : 190) :
                                200;
                            
                            return (
                                <circle
                                    key={index}
                                    cx={centerX}
                                    cy={centerY}
                                    r="30"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onClick={() => onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Labels */}
                    <text x="250" y="80" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-base">
                        {solution1.DisplayName}
                    </text>
                    <text x="250" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm font-semibold">
                        {overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution1.UniqueName)?.ComponentCount || 0} components
                    </text>
                    {(() => {
                        const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution1.UniqueName);
                        const typeSummary = overlap ? getComponentTypeSummary(overlap.SharedComponents) : [];
                        return typeSummary.map((typeText, index) => (
                            <text 
                                key={index}
                                x="250" 
                                y={115 + index * 12} 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                className="fill-white text-xs"
                            >
                                {typeText}
                            </text>
                        ));
                    })()}
                    
                    <text x="130" y="300" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-base">
                        {solution2.DisplayName}
                    </text>
                    <text x="130" y="320" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm font-semibold">
                        {overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution2.UniqueName)?.ComponentCount || 0} components
                    </text>
                    {(() => {
                        const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution2.UniqueName);
                        const typeSummary = overlap ? getComponentTypeSummary(overlap.SharedComponents) : [];
                        return typeSummary.map((typeText, index) => (
                            <text 
                                key={index}
                                x="130" 
                                y={335 + index * 12} 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                className="fill-white text-xs"
                            >
                                {typeText}
                            </text>
                        ));
                    })()}
                    
                    <text x="370" y="300" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-base">
                        {solution3.DisplayName}
                    </text>
                    <text x="370" y="320" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm font-semibold">
                        {overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution3.UniqueName)?.ComponentCount || 0} components
                    </text>
                    {(() => {
                        const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution3.UniqueName);
                        const typeSummary = overlap ? getComponentTypeSummary(overlap.SharedComponents) : [];
                        return typeSummary.map((typeText, index) => (
                            <text 
                                key={index}
                                x="370" 
                                y={335 + index * 12} 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                className="fill-white text-xs"
                            >
                                {typeText}
                            </text>
                        ));
                    })()}

                    {/* Overlap count labels */}
                    {overlaps.map((overlap, index) => {
                        if (overlap.SolutionNames.length > 1) {
                            const centerX = overlap.SolutionNames.length === 2 ? 
                                (overlap.SolutionNames.includes(solution1.UniqueName) && overlap.SolutionNames.includes(solution2.UniqueName) ? 215 :
                                 overlap.SolutionNames.includes(solution1.UniqueName) && overlap.SolutionNames.includes(solution3.UniqueName) ? 285 : 250) :
                                250;
                            const centerY = overlap.SolutionNames.length === 2 ?
                                (overlap.SolutionNames.includes(solution2.UniqueName) && overlap.SolutionNames.includes(solution3.UniqueName) ? 250 : 190) :
                                200;
                            
                            const typeSummary = getComponentTypeSummary(overlap.SharedComponents);
                            
                            return (
                                <g key={index}>
                                    <text x={centerX} y={centerY - 10} textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-sm">
                                        {overlap.ComponentCount}
                                    </text>
                                    {typeSummary.map((typeText, typeIndex) => (
                                        <text 
                                            key={typeIndex}
                                            x={centerX} 
                                            y={centerY + 5 + typeIndex * 12} 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            className="fill-white text-xs"
                                        >
                                            {typeText}
                                        </text>
                                    ))}
                                </g>
                            );
                        }
                        return null;
                    })}
                </svg>
            </div>
        );
    }

    function renderMultipleSolutions() {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-6">Multiple Solutions Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {solutions.map((solution, index) => {
                            const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution.UniqueName);
                            const typeSummary = overlap ? getComponentTypeSummary(overlap.SharedComponents) : [];
                            return (
                                <div 
                                    key={solution.SolutionId}
                                    className="p-4 rounded-lg border-2 cursor-pointer hover:opacity-80"
                                    style={{ borderColor: colors[index % colors.length], backgroundColor: colors[index % colors.length] + '20' }}
                                    onClick={() => overlap && onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                                >
                                    <div className="font-bold text-lg">{solution.DisplayName}</div>
                                    <div className="text-sm text-gray-700 font-semibold">{overlap?.ComponentCount || 0} components</div>
                                    {typeSummary.map((typeText, typeIndex) => (
                                        <div key={typeIndex} className="text-xs text-gray-600 mt-1">{typeText}</div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    
                    {overlaps.filter(o => o.SolutionNames.length > 1).length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold mb-4">Shared Components</h4>
                            <div className="space-y-3">
                                {overlaps.filter(o => o.SolutionNames.length > 1).map((overlap, index) => {
                                    const typeSummary = getComponentTypeSummary(overlap.SharedComponents);
                                    return (
                                        <div 
                                            key={index}
                                            className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50"
                                            onClick={() => onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                                        >
                                            <div className="font-semibold text-base">{overlap.SolutionNames.join(' + ')}</div>
                                            <div className="text-sm text-gray-700 font-medium">{overlap.ComponentCount} components</div>
                                            {typeSummary.map((typeText, typeIndex) => (
                                                <div key={typeIndex} className="text-xs text-gray-600 mt-1">{typeText}</div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};