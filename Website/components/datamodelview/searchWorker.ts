import { GroupType, EntityType, AttributeType } from "@/lib/Types";

// Worker message types
interface InitMessage {
  type: 'init';
  groups: GroupType[];
}

interface SearchMessage {
  type?: undefined;
  data?: string;
}

type WorkerMessage = InitMessage | SearchMessage | string;

interface ResultsMessage {
  type: 'results';
  data: Array<
    | { type: 'group'; group: GroupType }
    | { type: 'entity'; group: GroupType; entity: EntityType }
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

self.onmessage = async function(e: MessageEvent<WorkerMessage>) {
  // Handle initialization
  if (e.data && typeof e.data === 'object' && 'type' in e.data && e.data.type === 'init') {
    groups = e.data.groups;
    return;
  }
  
  // Handle search
  const search = (typeof e.data === 'string' ? e.data : e.data?.data || '').trim().toLowerCase();
  
  if (!groups) {
    const response: ResultsMessage = { type: 'results', data: [], complete: true };
    self.postMessage(response);
    return;
  }

  // First quickly send back a "started" message
  const startedMessage: StartedMessage = { type: 'started' };
  self.postMessage(startedMessage);
  
  const allItems: Array<
    | { type: 'group'; group: GroupType }
    | { type: 'entity'; group: GroupType; entity: EntityType }
  > = [];
  
  // Find all matches
  for (const group of groups) {
    const filteredEntities = group.Entities.filter((entity: EntityType) => {
      if (!search) return true;
      
      // Match entity schema or display name
      const entityMatch = entity.SchemaName.toLowerCase().includes(search) ||
        (entity.DisplayName && entity.DisplayName.toLowerCase().includes(search));
      
      // Match any attribute schema, display name, description, or option names
      const attrMatch = entity.Attributes.some((attr: AttributeType) => {
        const basicMatch = attr.SchemaName.toLowerCase().includes(search) ||
          (attr.DisplayName && attr.DisplayName.toLowerCase().includes(search)) ||
          (attr.Description && attr.Description.toLowerCase().includes(search));
        
        // Check options for ChoiceAttribute and StatusAttribute
        let optionsMatch = false;
        if (attr.AttributeType === 'ChoiceAttribute' || attr.AttributeType === 'StatusAttribute') {
          optionsMatch = attr.Options.some(option => option.Name.toLowerCase().includes(search));
        }
        
        return basicMatch || optionsMatch;
      });
      
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
    
    const response: ResultsMessage = {
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
