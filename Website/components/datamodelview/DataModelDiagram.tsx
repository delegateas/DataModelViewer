import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Groups } from '@/generated/Data';

interface Node {
  id: string;
  displayName: string;
  group: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Link {
  source: string;
  target: string;
  relationshipName: string;
}

export const DataModelDiagram: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous diagram
    d3.select(svgRef.current).selectAll('*').remove();

    // Extract nodes and links from the data
    const nodes: Node[] = [];
    const links: Link[] = [];
    const nodeIds = new Set<string>();

    // First pass: collect all nodes and track their IDs
    Groups.forEach(group => {
      group.Entities.forEach(entity => {
        if (!nodeIds.has(entity.SchemaName)) {
          nodes.push({
            id: entity.SchemaName,
            displayName: entity.DisplayName,
            group: group.Name,
            x: 0,
            y: 0,
            width: 150,
            height: 50
          });
          nodeIds.add(entity.SchemaName);
        }
      });
    });

    const illegaSchemas = new Set<string>([
        'owningteam',
        'owninguser',
        'owningbusinessunit',
        'modifiedonbehalfby',
        'createdonbehalfby',
        'modifiedby',
        'createdby',
    ]);
    // Second pass: collect relationships, but only for nodes that exist
    Groups.forEach(group => {
      group.Entities.forEach(entity => {
        entity.Relationships.forEach(relationship => {
          if (nodeIds.has(entity.SchemaName) && nodeIds.has(relationship.TableSchema) && !illegaSchemas.has(relationship.Name)) {
            links.push({
              source: entity.SchemaName,
              target: relationship.TableSchema,
              relationshipName: relationship.Name
            });
          }
        });
      });
    });

    // Set up SVG dimensions - even larger for better spacing
    const width = 4000;
    const height = 3000;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create color scale for groups
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Group nodes by their group property
    const groupedNodes = d3.group(nodes, d => d.group);
    const groupNames = Array.from(groupedNodes.keys());

    // Calculate 2D grid layout for groups with much bigger spacing
    const groupsPerRow = Math.ceil(Math.sqrt(groupNames.length));
    const groupsPerCol = Math.ceil(groupNames.length / groupsPerRow);
    
    // Group layout parameters - increased spacing significantly
    const groupWidth = 600;  // Increased from 400
    const groupHeight = 400; // Increased from 300
    const groupPadding = 200; // Increased from 100
    const nodesPerRow = 3;
    const nodeSpacing = 200; // Increased from 180
    
    // Position groups in 2D grid
    groupNames.forEach((groupName, groupIndex) => {
      const groupNodes = groupedNodes.get(groupName) || [];
      
      // Calculate group position in grid
      const groupRow = Math.floor(groupIndex / groupsPerRow);
      const groupCol = groupIndex % groupsPerRow;
      
      const groupStartX = groupCol * (groupWidth + groupPadding) + 150;
      const groupStartY = groupRow * (groupHeight + groupPadding) + 150;
      
      // Position nodes within each group
      groupNodes.forEach((node, nodeIndex) => {
        const nodeRow = Math.floor(nodeIndex / nodesPerRow);
        const nodeCol = nodeIndex % nodesPerRow;
        
        node.x = groupStartX + nodeCol * nodeSpacing;
        node.y = groupStartY + nodeRow * (node.height + 80); // Increased vertical spacing
      });
    });

    // Create main container group for zoom/pan
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Create group backgrounds
    const groupBackgrounds = mainGroup.append('g')
      .attr('class', 'group-backgrounds')
      .selectAll('rect')
      .data(groupNames)
      .enter().append('rect')
      .attr('fill', d => colorScale(d))
      .attr('fill-opacity', 0.1)
      .attr('stroke', d => colorScale(d))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('rx', 10);

    // Create group labels
    const groupLabels = mainGroup.append('g')
      .attr('class', 'group-labels')
      .selectAll('text')
      .data(groupNames)
      .enter().append('text')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', d => colorScale(d))
      .text(d => d);

    // Update group backgrounds and labels
    groupNames.forEach((groupName, groupIndex) => {
      const groupNodes = groupedNodes.get(groupName) || [];
      if (groupNodes.length > 0) {
        const minX = d3.min(groupNodes, d => d.x - d.width/2) || 0;
        const maxX = d3.max(groupNodes, d => d.x + d.width/2) || 0;
        const minY = d3.min(groupNodes, d => d.y - d.height/2) || 0;
        const maxY = d3.max(groupNodes, d => d.y + d.height/2) || 0;
        
        groupBackgrounds.filter((d, i) => i === groupIndex)
          .attr('x', minX - 40)
          .attr('y', minY - 60)
          .attr('width', maxX - minX + 80)
          .attr('height', maxY - minY + 100);

        groupLabels.filter((d, i) => i === groupIndex)
          .attr('x', minX - 30)
          .attr('y', minY - 35);
      }
    });

    // Create arrow markers
    mainGroup.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#666');

    // Enhanced function to create right-angled paths with collision avoidance
    const createRightAngledPath = (sourceNode: Node, targetNode: Node, linkIndex: number) => {
      const sourceX = sourceNode.x;
      const sourceY = sourceNode.y;
      const targetX = targetNode.x;
      const targetY = targetNode.y;

      // Get group boundaries for routing
      const getGroupBounds = (groupName: string) => {
        const groupNodes = groupedNodes.get(groupName) || [];
        if (groupNodes.length === 0) return null;
        
        const minX = d3.min(groupNodes, d => d.x - d.width/2) || 0;
        const maxX = d3.max(groupNodes, d => d.x + d.width/2) || 0;
        const minY = d3.min(groupNodes, d => d.y - d.height/2) || 0;
        const maxY = d3.max(groupNodes, d => d.y + d.height/2) || 0;
        
        return {
          left: minX - 40,
          right: maxX + 40,
          top: minY - 60,
          bottom: maxY + 100
        };
      };

      // Calculate optimized connection points using all four sides
      const calculateOptimalConnectionPoints = (source: Node, target: Node) => {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        
        // Count existing connections for each side of both nodes
        const sourceConnections = { top: 0, bottom: 0, left: 0, right: 0 };
        const targetConnections = { top: 0, bottom: 0, left: 0, right: 0 };
        
        // Count connections for better distribution
        links.forEach((link, idx) => {
          if (idx >= linkIndex) return; // Only count already processed links
          
          const linkSource = nodes.find(n => n.id === link.source);
          const linkTarget = nodes.find(n => n.id === link.target);
          if (!linkSource || !linkTarget) return;
          
          // Determine which sides were used for existing connections
          if (link.source === source.id) {
            const linkDx = linkTarget.x - linkSource.x;
            const linkDy = linkTarget.y - linkSource.y;
            if (Math.abs(linkDx) > Math.abs(linkDy)) {
              sourceConnections[linkDx > 0 ? 'right' : 'left']++;
            } else {
              sourceConnections[linkDy > 0 ? 'bottom' : 'top']++;
            }
          }
          
          if (link.target === target.id) {
            const linkDx = linkSource.x - linkTarget.x;
            const linkDy = linkSource.y - linkTarget.y;
            if (Math.abs(linkDx) > Math.abs(linkDy)) {
              targetConnections[linkDx > 0 ? 'right' : 'left']++;
            } else {
              targetConnections[linkDy > 0 ? 'bottom' : 'top']++;
            }
          }
        });
        
        // Determine best connection sides based on direction and usage
        let sourceSide: 'top' | 'bottom' | 'left' | 'right';
        let targetSide: 'top' | 'bottom' | 'left' | 'right';
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal primary direction
          if (dx > 0) {
            sourceSide = 'right';
            targetSide = 'left';
          } else {
            sourceSide = 'left';
            targetSide = 'right';
          }
        } else {
          // Vertical primary direction
          if (dy > 0) {
            sourceSide = 'bottom';
            targetSide = 'top';
          } else {
            sourceSide = 'top';
            targetSide = 'bottom';
          }
        }
        
        // Calculate connection points with offsets for multiple connections
        const getConnectionPoint = (node: Node, side: string, connectionCount: number) => {
          const offset = (connectionCount % 3 - 1) * 25; // -25, 0, 25
          
          switch (side) {
            case 'top':
              return { x: node.x + offset, y: node.y - node.height/2 };
            case 'bottom':
              return { x: node.x + offset, y: node.y + node.height/2 };
            case 'left':
              return { x: node.x - node.width/2, y: node.y + offset };
            case 'right':
              return { x: node.x + node.width/2, y: node.y + offset };
            default:
              return { x: node.x, y: node.y };
          }
        };
        
        const sourcePoint = getConnectionPoint(source, sourceSide, sourceConnections[sourceSide]);
        const targetPoint = getConnectionPoint(target, targetSide, targetConnections[targetSide]);
        
        return {
          startX: sourcePoint.x,
          startY: sourcePoint.y,
          endX: targetPoint.x,
          endY: targetPoint.y,
          sourceSide,
          targetSide
        };
      };

      // Enhanced collision detection with better node avoidance
      const hasPathCollision = (path: { x: number, y: number }[]) => {
        const allOtherNodes = nodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id);
        
        for (let i = 0; i < path.length - 1; i++) {
          const segmentStart = path[i];
          const segmentEnd = path[i + 1];
          
          for (const node of allOtherNodes) {
            if (lineIntersectsNode(segmentStart.x, segmentStart.y, segmentEnd.x, segmentEnd.y, node)) {
              return true;
            }
          }
        }
        return false;
      };

      // Check if a line segment intersects with a node (with better buffer)
      const lineIntersectsNode = (x1: number, y1: number, x2: number, y2: number, node: Node) => {
        const buffer = 15; // Increased buffer around nodes
        const nodeLeft = node.x - node.width/2 - buffer;
        const nodeRight = node.x + node.width/2 + buffer;
        const nodeTop = node.y - node.height/2 - buffer;
        const nodeBottom = node.y + node.height/2 + buffer;
        
        // Check if line segment intersects with expanded node rectangle
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        
        return !(nodeRight < minX || nodeLeft > maxX || nodeBottom < minY || nodeTop > maxY);
      };

      const { startX, startY, endX, endY, sourceSide, targetSide } = calculateOptimalConnectionPoints(sourceNode, targetNode);

      // Check if source and target are in the same group
      const sameGroup = sourceNode.group === targetNode.group;
      
      if (sameGroup) {
        // Same group routing with better collision avoidance
        const offsetDistance = 80; // Increased offset for better clearance
        
        // Try multiple routing strategies
        const routingStrategies = [
          // Strategy 1: Direct L-shaped path
          () => {
            const path = [
              { x: startX, y: startY },
              { x: startX, y: endY },
              { x: endX, y: endY }
            ];
            
            if (!hasPathCollision(path)) {
              return `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
            }
            return null;
          },
          
          // Strategy 2: Route above
          () => {
            const routeY = Math.min(sourceNode.y, targetNode.y) - offsetDistance;
            const path = [
              { x: startX, y: startY },
              { x: startX, y: routeY },
              { x: endX, y: routeY },
              { x: endX, y: endY }
            ];
            
            if (!hasPathCollision(path)) {
              return `M ${startX} ${startY} L ${startX} ${routeY} L ${endX} ${routeY} L ${endX} ${endY}`;
            }
            return null;
          },
          
          // Strategy 3: Route below
          () => {
            const routeY = Math.max(sourceNode.y, targetNode.y) + offsetDistance;
            const path = [
              { x: startX, y: startY },
              { x: startX, y: routeY },
              { x: endX, y: routeY },
              { x: endX, y: endY }
            ];
            
            if (!hasPathCollision(path)) {
              return `M ${startX} ${startY} L ${startX} ${routeY} L ${endX} ${routeY} L ${endX} ${endY}`;
            }
            return null;
          },
          
          // Strategy 4: Route to the side
          () => {
            const routeX = sourceNode.x < targetNode.x ? 
              Math.min(sourceNode.x, targetNode.x) - offsetDistance :
              Math.max(sourceNode.x, targetNode.x) + offsetDistance;
            
            const path = [
              { x: startX, y: startY },
              { x: routeX, y: startY },
              { x: routeX, y: endY },
              { x: endX, y: endY }
            ];
            
            if (!hasPathCollision(path)) {
              return `M ${startX} ${startY} L ${routeX} ${startY} L ${routeX} ${endY} L ${endX} ${endY}`;
            }
            return null;
          }
        ];
        
        // Try each strategy until one works
        for (const strategy of routingStrategies) {
          const result = strategy();
          if (result) return result;
        }
        
        // Fallback: simple L-shaped path
        return `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
        
      } else {
        // Cross-group routing with enhanced group boundary awareness
        const sourceGroupBounds = getGroupBounds(sourceNode.group);
        const targetGroupBounds = getGroupBounds(targetNode.group);
        
        if (!sourceGroupBounds || !targetGroupBounds) {
          const midX = startX + (endX - startX) * 0.5;
          return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        }
        
        // More sophisticated group boundary routing
        const sourceGroupCenterX = (sourceGroupBounds.left + sourceGroupBounds.right) / 2;
        const sourceGroupCenterY = (sourceGroupBounds.top + sourceGroupBounds.bottom) / 2;
        const targetGroupCenterX = (targetGroupBounds.left + targetGroupBounds.right) / 2;
        const targetGroupCenterY = (targetGroupBounds.top + targetGroupBounds.bottom) / 2;
        
        const horizontalGap = 60; // Increased gap for better visibility
        const verticalGap = 60;
        
        // Determine routing based on group relationship
        if (targetGroupCenterX > sourceGroupCenterX) {
          // Target group is to the right
          const routeX1 = sourceGroupBounds.right + horizontalGap;
          const routeX2 = targetGroupBounds.left - horizontalGap;
          
          if (Math.abs(targetGroupCenterY - sourceGroupCenterY) < 200) {
            // Groups are horizontally aligned
            return `M ${startX} ${startY} L ${routeX1} ${startY} L ${routeX1} ${endY} L ${routeX2} ${endY} L ${endX} ${endY}`;
          } else {
            // Groups are diagonally positioned
            const routeY = targetGroupCenterY > sourceGroupCenterY ? 
              targetGroupBounds.top - verticalGap : 
              targetGroupBounds.bottom + verticalGap;
            return `M ${startX} ${startY} L ${routeX1} ${startY} L ${routeX1} ${routeY} L ${endX} ${routeY} L ${endX} ${endY}`;
          }
        } else {
          // Target group is to the left
          const routeX1 = sourceGroupBounds.left - horizontalGap;
          const routeX2 = targetGroupBounds.right + horizontalGap;
          
          if (Math.abs(targetGroupCenterY - sourceGroupCenterY) < 200) {
            // Groups are horizontally aligned
            return `M ${startX} ${startY} L ${routeX1} ${startY} L ${routeX1} ${endY} L ${routeX2} ${endY} L ${endX} ${endY}`;
          } else {
            // Groups are diagonally positioned
            const routeY = targetGroupCenterY > sourceGroupCenterY ? 
              targetGroupBounds.top - verticalGap : 
              targetGroupBounds.bottom + verticalGap;
            return `M ${startX} ${startY} L ${routeX1} ${startY} L ${routeX1} ${routeY} L ${endX} ${routeY} L ${endX} ${endY}`;
          }
        }
      }
    };

    // Function to calculate the midpoint of a path for label placement
    const getPathMidpoint = (pathString: string) => {
      const commands = pathString.split(/[ML]/);
      const points = commands.slice(1).map(cmd => {
        const coords = cmd.trim().split(' ');
        return { x: parseFloat(coords[0]), y: parseFloat(coords[1]) };
      }).filter(p => !isNaN(p.x) && !isNaN(p.y));
      
      if (points.length < 2) return { x: 0, y: 0 };
      
      // Find the midpoint along the path
      const midIndex = Math.floor(points.length / 2);
      if (points.length % 2 === 0) {
        // Even number of points - interpolate between two middle points
        const p1 = points[midIndex - 1];
        const p2 = points[midIndex];
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      } else {
        // Odd number of points - use middle point
        return points[midIndex];
      }
    };

    // Create links with improved right-angled paths
    const linkGroup = mainGroup.append('g').attr('class', 'links');
    
    links.forEach((link, linkIndex) => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        // Create path
        const pathString = createRightAngledPath(sourceNode, targetNode, linkIndex);
        const path = linkGroup.append('path')
          .attr('d', pathString)
          .attr('stroke', '#666')
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('stroke-opacity', 0.8)
          .attr('marker-end', 'url(#arrowhead)')
          .attr('class', `link-${linkIndex}`)
          .style('cursor', 'pointer');

        // Add hover effects for better traceability
        path.on('mouseover', function() {
          d3.select(this)
            .attr('stroke', '#ff6b35')
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1);
          
          // Highlight associated label
          d3.select(`.label-${linkIndex}`)
            .attr('fill', '#ff6b35')
            .attr('font-weight', 'bold');
            
          // Highlight label background
          d3.select(`.label-bg-${linkIndex}`)
            .attr('stroke', '#ff6b35')
            .attr('stroke-width', 2);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.8);
            
          // Reset label style
          d3.select(`.label-${linkIndex}`)
            .attr('fill', '#333')
            .attr('font-weight', 'normal');
            
          // Reset label background
          d3.select(`.label-bg-${linkIndex}`)
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1);
        });

        // Calculate optimal label position along the path
        const midpoint = getPathMidpoint(pathString);
        
        // Create background rectangle for label
        const labelBg = linkGroup.append('rect')
          .attr('class', `label-bg-${linkIndex}`)
          .attr('fill', 'white')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4)
          .attr('opacity', 0.95);

        // Create label text
        const label = linkGroup.append('text')
          .attr('class', `label-${linkIndex}`)
          .attr('x', midpoint.x)
          .attr('y', midpoint.y + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#333')
          .style('cursor', 'pointer')
          .text(link.relationshipName);

        // Add hover effects to label as well
        label.on('mouseover', function() {
          // Highlight the path
          d3.select(`.link-${linkIndex}`)
            .attr('stroke', '#ff6b35')
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 1);
          
          // Highlight label
          d3.select(this)
            .attr('fill', '#ff6b35')
            .attr('font-weight', 'bold');
            
          // Highlight label background
          labelBg.attr('stroke', '#ff6b35')
            .attr('stroke-width', 2);
        })
        .on('mouseout', function() {
          // Reset path
          d3.select(`.link-${linkIndex}`)
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.8);
          
          // Reset label
          d3.select(this)
            .attr('fill', '#333')
            .attr('font-weight', 'normal');
            
          // Reset label background
          labelBg.attr('stroke', '#ccc')
            .attr('stroke-width', 1);
        });

        // Adjust background size based on text
        const textBBox = (label.node() as SVGTextElement)?.getBBox();
        if (textBBox) {
          labelBg
            .attr('width', textBBox.width + 8)
            .attr('height', textBBox.height + 4)
            .attr('x', midpoint.x - textBBox.width/2 - 4)
            .attr('y', midpoint.y - textBBox.height/2 - 2);
        }
      }
    });

    // Create nodes
    const nodeGroup = mainGroup.append('g').attr('class', 'nodes');
    
    nodes.forEach(node => {
      const nodeContainer = nodeGroup.append('g')
        .attr('transform', `translate(${node.x}, ${node.y})`);

      // Add rectangle for entity
      nodeContainer.append('rect')
        .attr('width', node.width)
        .attr('height', node.height)
        .attr('x', -node.width / 2)
        .attr('y', -node.height / 2)
        .attr('fill', colorScale(node.group))
        .attr('fill-opacity', 0.8)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('rx', 8)
        .style('cursor', 'move');

      // Add text label
      nodeContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#fff')
        .text(node.displayName);

      // Add drag behavior - fixed to work with zoom
      // @ts-ignore
      nodeContainer.call(d3.drag<SVGGElement, Node>()
        .on('start', function(event) {
          d3.select(this).raise();
        })
        .on('drag', function(event) {
          // Update node position
          node.x = event.x;
          node.y = event.y;
          
          // Update visual position
          d3.select(this).attr('transform', `translate(${node.x}, ${node.y})`);
          
          // Update all connected links
          linkGroup.selectAll('path').each(function(d, i) {
            const linkData = links[i];
            if (linkData && (linkData.source === node.id || linkData.target === node.id)) {
              const sourceNode = nodes.find(n => n.id === linkData.source);
              const targetNode = nodes.find(n => n.id === linkData.target);
              if (sourceNode && targetNode) {
                d3.select(this).attr('d', createRightAngledPath(sourceNode, targetNode, i));
              }
            }
          });

          // Update all connected labels
          linkGroup.selectAll('text').each(function(d, i) {
            const linkData = links[i];
            if (linkData && (linkData.source === node.id || linkData.target === node.id)) {
              const sourceNode = nodes.find(n => n.id === linkData.source);
              const targetNode = nodes.find(n => n.id === linkData.target);
              if (sourceNode && targetNode) {
                const midX = sourceNode.x + (targetNode.x - sourceNode.x) / 2;
                const midY = sourceNode.y + (targetNode.y - sourceNode.y) / 2;
                d3.select(this).attr('x', midX).attr('y', midY - 8);
              }
            }
          });

          // Update label backgrounds
          linkGroup.selectAll('rect').each(function(d, i) {
            const linkData = links[i];
            if (linkData && (linkData.source === node.id || linkData.target === node.id)) {
              const sourceNode = nodes.find(n => n.id === linkData.source);
              const targetNode = nodes.find(n => n.id === linkData.target);
              if (sourceNode && targetNode) {
                const midX = sourceNode.x + (targetNode.x - sourceNode.x) / 2;
                const midY = sourceNode.y + (targetNode.y - sourceNode.y) / 2;
                d3.select(this).attr('x', midX - 35).attr('y', midY - 18);
              }
            }
          });
        }));
    });

    // Add zoom and pan - fixed to only transform the main group
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial zoom to fit content
    const bounds = mainGroup.node()?.getBBox();
    if (bounds) {
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const midX = bounds.x + fullWidth / 2;
      const midY = bounds.y + fullHeight / 2;
      
      const scale = Math.min(width / fullWidth, height / fullHeight) * 0.8;
      const translate = [width / 2 - scale * midX, height / 2 - scale * midY];
      
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    }

  }, []);

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Data Model Relationships</h2>
        <div className="border rounded-lg bg-white overflow-hidden">
          <svg ref={svgRef} className="w-full h-full min-h-[800px]"></svg>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>• Groups have increased spacing for better visibility</p>
          <p>• Drag functionality fixed to work with zoom/pan</p>
          <p>• Right-angled arrows with collision avoidance</p>
          <p>• Auto-zoom to fit content on load</p>
          <p>• Scroll to zoom, drag background to pan</p>
        </div>
      </div>
    </div>
  );
};