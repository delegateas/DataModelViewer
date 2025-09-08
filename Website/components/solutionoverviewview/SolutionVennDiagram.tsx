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
        
        return (
            <div className="flex items-center justify-center h-64">
                <svg width="300" height="200" viewBox="0 0 300 200">
                    <circle
                        cx="150"
                        cy="100"
                        r="80"
                        fill={colors[0]}
                        fillOpacity="0.6"
                        stroke={colors[0]}
                        strokeWidth="2"
                        className="cursor-pointer hover:fillOpacity-0.8"
                        onClick={() => overlap && onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                    />
                    <text x="150" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-white font-semibold">
                        {solution.DisplayName}
                    </text>
                    <text x="150" y="115" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm">
                        {overlap?.ComponentCount || 0} components
                    </text>
                </svg>
            </div>
        );
    }

    function renderTwoSolutions() {
        const [solution1, solution2] = solutions;
        const overlap1 = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution1.UniqueName);
        const overlap2 = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution2.UniqueName);
        const overlapBoth = overlaps.find(o => o.SolutionNames.length === 2);

        return (
            <div className="flex items-center justify-center h-64">
                <svg width="400" height="250" viewBox="0 0 400 250">
                    {/* Solution 1 Circle */}
                    <circle
                        cx="140"
                        cy="125"
                        r="80"
                        fill={colors[0]}
                        fillOpacity="0.6"
                        stroke={colors[0]}
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => overlap1 && onOverlapClick(overlap1.SolutionNames, overlap1.SharedComponents)}
                    />
                    
                    {/* Solution 2 Circle */}
                    <circle
                        cx="260"
                        cy="125"
                        r="80"
                        fill={colors[1]}
                        fillOpacity="0.6"
                        stroke={colors[1]}
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => overlap2 && onOverlapClick(overlap2.SolutionNames, overlap2.SharedComponents)}
                    />

                    {/* Overlap area - invisible clickable region */}
                    <ellipse
                        cx="200"
                        cy="125"
                        rx="40"
                        ry="60"
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => overlapBoth && onOverlapClick(overlapBoth.SolutionNames, overlapBoth.SharedComponents)}
                    />

                    {/* Labels */}
                    <text x="100" y="125" textAnchor="middle" dominantBaseline="middle" className="fill-white font-semibold text-sm">
                        {solution1.DisplayName}
                    </text>
                    <text x="100" y="140" textAnchor="middle" dominantBaseline="middle" className="fill-white text-xs">
                        {overlap1?.ComponentCount || 0}
                    </text>
                    
                    <text x="300" y="125" textAnchor="middle" dominantBaseline="middle" className="fill-white font-semibold text-sm">
                        {solution2.DisplayName}
                    </text>
                    <text x="300" y="140" textAnchor="middle" dominantBaseline="middle" className="fill-white text-xs">
                        {overlap2?.ComponentCount || 0}
                    </text>
                    
                    <text x="200" y="125" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-sm">
                        {overlapBoth?.ComponentCount || 0}
                    </text>
                    <text x="200" y="140" textAnchor="middle" dominantBaseline="middle" className="fill-white text-xs">
                        shared
                    </text>
                </svg>
            </div>
        );
    }

    function renderThreeSolutions() {
        const [solution1, solution2, solution3] = solutions;
        
        return (
            <div className="flex items-center justify-center h-80">
                <svg width="400" height="350" viewBox="0 0 400 350">
                    {/* Solution 1 Circle (top) */}
                    <circle
                        cx="200"
                        cy="100"
                        r="70"
                        fill={colors[0]}
                        fillOpacity="0.6"
                        stroke={colors[0]}
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                            const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution1.UniqueName);
                            if (overlap) onOverlapClick(overlap.SolutionNames, overlap.SharedComponents);
                        }}
                    />
                    
                    {/* Solution 2 Circle (bottom left) */}
                    <circle
                        cx="150"
                        cy="200"
                        r="70"
                        fill={colors[1]}
                        fillOpacity="0.6"
                        stroke={colors[1]}
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                            const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution2.UniqueName);
                            if (overlap) onOverlapClick(overlap.SolutionNames, overlap.SharedComponents);
                        }}
                    />

                    {/* Solution 3 Circle (bottom right) */}
                    <circle
                        cx="250"
                        cy="200"
                        r="70"
                        fill={colors[2]}
                        fillOpacity="0.6"
                        stroke={colors[2]}
                        strokeWidth="2"
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
                                (overlap.SolutionNames.includes(solution1.UniqueName) && overlap.SolutionNames.includes(solution2.UniqueName) ? 175 :
                                 overlap.SolutionNames.includes(solution1.UniqueName) && overlap.SolutionNames.includes(solution3.UniqueName) ? 225 : 200) :
                                200;
                            const centerY = overlap.SolutionNames.length === 2 ?
                                (overlap.SolutionNames.includes(solution2.UniqueName) && overlap.SolutionNames.includes(solution3.UniqueName) ? 200 : 150) :
                                150;
                            
                            return (
                                <circle
                                    key={index}
                                    cx={centerX}
                                    cy={centerY}
                                    r="20"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onClick={() => onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Labels */}
                    <text x="200" y="65" textAnchor="middle" dominantBaseline="middle" className="fill-white font-semibold text-sm">
                        {solution1.DisplayName}
                    </text>
                    <text x="120" y="235" textAnchor="middle" dominantBaseline="middle" className="fill-white font-semibold text-sm">
                        {solution2.DisplayName}
                    </text>
                    <text x="280" y="235" textAnchor="middle" dominantBaseline="middle" className="fill-white font-semibold text-sm">
                        {solution3.DisplayName}
                    </text>
                </svg>
            </div>
        );
    }

    function renderMultipleSolutions() {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Multiple Solutions Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {solutions.map((solution, index) => {
                            const overlap = overlaps.find(o => o.SolutionNames.length === 1 && o.SolutionNames[0] === solution.UniqueName);
                            return (
                                <div 
                                    key={solution.SolutionId}
                                    className="p-4 rounded-lg border-2 cursor-pointer hover:opacity-80"
                                    style={{ borderColor: colors[index % colors.length], backgroundColor: colors[index % colors.length] + '20' }}
                                    onClick={() => overlap && onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                                >
                                    <div className="font-semibold">{solution.DisplayName}</div>
                                    <div className="text-sm text-gray-600">{overlap?.ComponentCount || 0} components</div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {overlaps.filter(o => o.SolutionNames.length > 1).length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-md font-semibold mb-2">Shared Components</h4>
                            <div className="space-y-2">
                                {overlaps.filter(o => o.SolutionNames.length > 1).map((overlap, index) => (
                                    <div 
                                        key={index}
                                        className="p-3 rounded border cursor-pointer hover:bg-gray-50"
                                        onClick={() => onOverlapClick(overlap.SolutionNames, overlap.SharedComponents)}
                                    >
                                        <div className="font-medium">{overlap.SolutionNames.join(' + ')}</div>
                                        <div className="text-sm text-gray-600">{overlap.ComponentCount} shared components</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};