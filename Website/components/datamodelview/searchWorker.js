let groups = null;

self.onmessage = function(e) {
  if (e.data && e.data.type === 'init') {
    groups = e.data.groups;
    return;
  }
  // e.data is the search string
  const search = (e.data || '').trim().toLowerCase();
  if (!groups) {
    self.postMessage([]);
    return;
  }
  const items = [];
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
      items.push({ type: 'group', group });
      for (const entity of filteredEntities) {
        items.push({ type: 'entity', group, entity });
      }
    }
  }
  self.postMessage(items);
}; 