import { EntityType } from '@/lib/Types';
import { Groups, SolutionWarnings, SolutionCount } from '../../generated/Data';

self.onmessage = function () {
  const entityMap = new Map<string, EntityType>();
  Groups.forEach(group => {
    group.Entities.forEach(entity => {
      entityMap.set(entity.SchemaName, entity);
    });
  });
  self.postMessage({ groups: Groups, entityMap: entityMap, warnings: SolutionWarnings, solutionCount: SolutionCount });
}; 