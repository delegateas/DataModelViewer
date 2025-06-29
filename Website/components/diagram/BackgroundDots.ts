import { dia } from '@joint/core';

export const createBackgroundDots = (graph: dia.Graph, paper: dia.Paper) => {
  // Remove existing background dots
  graph.getElements().forEach(el => {
    if (el.get('type') === 'background.dots') {
      el.remove();
    }
  });

  const paperSize = paper.getComputedSize();
  const dotSpacing = 20; // Base spacing between dots
  const dotRadius = 1; // Smaller, less prominent dots
  
  // Create dots across the entire paper area
  for (let x = 0; x < paperSize.width; x += dotSpacing) {
    for (let y = 0; y < paperSize.height; y += dotSpacing) {
      const dot = new dia.Element({
        type: 'background.dots',
        position: { x, y },
        size: { width: dotRadius * 2, height: dotRadius * 2 },
        attrs: {
          body: {
            cx: dotRadius,
            cy: dotRadius,
            r: dotRadius,
            fill: '#d1d5db', // Light gray, less prominent
            stroke: 'none'
          }
        },
        markup: [
          { tagName: 'circle', selector: 'body' }
        ]
      });
      dot.addTo(graph);
    }
  }
}; 