import { GroupType, EntityType, AttributeType } from "@/lib/Types";

// Worker message types
interface InitMessage {
  type: 'init';
  groups: GroupType[];
}

interface EntityFilterState {
  hideStandardFields: boolean;
  typeFilter: string;
}

interface SearchMessage {
  type: 'search';
  data: string;
  entityFilters?: Record<string, EntityFilterState>;
}

type WorkerMessage = InitMessage | SearchMessage | string;

interface ResultsMessage {
  type: 'results';
  data: Array<
    | { type: 'group'; group: GroupType }
    | { type: 'entity'; group: GroupType; entity: EntityType }
    | { type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType }
  >;
  complete: boolean;
  progress?: number;
}

interface StartedMessage {
  type: 'started';
}

type WorkerResponse = ResultsMessage | StartedMessage;

let groups: GroupType[] | null = null;
const CHUNK_SIZE = 20; // Process results in chunks

self.onmessage = async function (e: MessageEvent<WorkerMessage>) {
  // Handle initialization
  if (e.data && typeof e.data === 'object' && 'type' in e.data && e.data.type === 'init') {
    groups = e.data.groups;
    return;
  }

  if (!groups) {
    const response: WorkerResponse = { type: 'results', data: [], complete: true };
    self.postMessage(response);
    return;
  }

  // Handle search
  const search = (typeof e.data === 'string' ? e.data : e.data?.data || '').trim().toLowerCase();
  const entityFilters: Record<string, EntityFilterState> = (typeof e.data === 'object' && 'entityFilters' in e.data) ? e.data.entityFilters || {} : {};

  if (!search) {
    const response: WorkerResponse = { type: 'results', data: [], complete: true };
    self.postMessage(response);
    return;
  }

  // First quickly send back a "started" message
  const startedMessage: WorkerResponse = { type: 'started' };
  self.postMessage(startedMessage);

  const allItems: Array<
    | { type: 'group'; group: GroupType }
    | { type: 'entity'; group: GroupType; entity: EntityType }
    | { type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType }
  > = [];

  ////////////////////////////////////////////////
  // Finding matches part
  ////////////////////////////////////////////////
  for (const group of groups) {
    let groupUsed = false;
    for (const entity of group.Entities) {
      // Get entity-specific filters (default to showing all if not set)
      const entityFilter = entityFilters[entity.SchemaName] || { hideStandardFields: true, typeFilter: 'all' };

      // Find all matching attributes
      const matchingAttributes = entity.Attributes.filter((attr: AttributeType) => {
        // Apply hideStandardFields filter
        if (entityFilter.hideStandardFields) {
          const isStandardFieldHidden = !attr.IsCustomAttribute && !attr.IsStandardFieldModified;
          if (isStandardFieldHidden) return false;
        }

        // Apply type filter
        if (entityFilter.typeFilter && entityFilter.typeFilter !== 'all') {
          // Special case: ChoiceAttribute filter also includes StatusAttribute
          if (entityFilter.typeFilter === 'ChoiceAttribute') {
            if (attr.AttributeType !== 'ChoiceAttribute' && attr.AttributeType !== 'StatusAttribute') {
              return false;
            }
          } else {
            if (attr.AttributeType !== entityFilter.typeFilter) {
              return false;
            }
          }
        }

        // Apply search matching
        const basicMatch = attr.SchemaName.toLowerCase().includes(search) ||
          (attr.DisplayName && attr.DisplayName.toLowerCase().includes(search)) ||
          (attr.Description && attr.Description.toLowerCase().includes(search));
        let optionsMatch = false;
        if (attr.AttributeType === 'ChoiceAttribute' || attr.AttributeType === 'StatusAttribute') {
          optionsMatch = attr.Options.some(option => option.Name.toLowerCase().includes(search));
        }

        return basicMatch || optionsMatch;
      });

      // If we have matching attributes, add the entity first (for sidebar) then the attributes
      if (matchingAttributes.length > 0) {
        if (!groupUsed) allItems.push({ type: 'group', group });
        groupUsed = true;
        allItems.push({ type: 'entity', group, entity });
        for (const attr of matchingAttributes) {
          allItems.push({ type: 'attribute', group, entity, attribute: attr });
        }
      }
    }
  }

  // Send results in chunks to prevent UI blocking
  for (let i = 0; i < allItems.length; i += CHUNK_SIZE) {
    const chunk = allItems.slice(i, i + CHUNK_SIZE);
    const isLastChunk = i + CHUNK_SIZE >= allItems.length;

    const response: WorkerResponse = {
      type: 'results',
      data: chunk,
      complete: isLastChunk,
      progress: Math.min(100, Math.round((i + CHUNK_SIZE) / allItems.length * 100))
    };

    self.postMessage(response);

    // Small delay between chunks to let the UI breathe
    if (!isLastChunk) {
      // Use a proper yielding mechanism to let the UI breathe
      await sleep(5);
    }
  }
};

// Helper function to pause execution for a specified duration
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
