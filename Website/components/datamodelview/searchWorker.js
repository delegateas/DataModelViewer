let groups = null;
const CHUNK_SIZE = 20; // Process results in chunks

self.onmessage = function(e) {
  if (e.data && e.data.type === 'init') {
    groups = e.data.groups;
    return;
  }
  
  const search = (e.data || '').trim().toLowerCase();
  if (!groups) {
    self.postMessage({ type: 'results', data: [], complete: true });
    return;
  }

  // First quickly send back a "started" message
  self.postMessage({ type: 'started' });
  
  const allItems = [];
  
  // Find all matches
  for (const group of groups) {
    const filteredEntities = group.Entities.filter(entity => {
      if (!search) return true;
      const entityMatch = entity.SchemaName.toLowerCase().includes(search) ||
        (entity.DisplayName && entity.DisplayName.toLowerCase().includes(search));
      const attrMatch = entity.Attributes.some(attr =>
        attr.SchemaName.toLowerCase().includes(search) ||
        (attr.DisplayName && attr.DisplayName.toLowerCase().includes(search))
      );
      return entityMatch || attrMatch;
    });
    
    if (filteredEntities.length > 0) {
      allItems.push({ type: 'group', group });
      for (const entity of filteredEntities) {
        allItems.push({ type: 'entity', group, entity });
      }
    }
  }
  
  // Send results in chunks to prevent UI blocking
  for (let i = 0; i < allItems.length; i += CHUNK_SIZE) {
    const chunk = allItems.slice(i, i + CHUNK_SIZE);
    const isLastChunk = i + CHUNK_SIZE >= allItems.length;
    
    self.postMessage({
      type: 'results',
      data: chunk,
      complete: isLastChunk,
      progress: Math.min(100, Math.round((i + CHUNK_SIZE) / allItems.length * 100))
    });
    
    // Small delay between chunks to let the UI breathe
    if (!isLastChunk) {
      // Use a proper yielding mechanism to let the UI breathe
      await sleep(5);
    }
  }

  // Helper function to pause execution for a specified duration
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}; 