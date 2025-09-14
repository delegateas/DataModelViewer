import { Groups, SolutionWarnings } from '../../generated/Data';

self.onmessage = function() {
    self.postMessage({ groups: Groups, warnings: SolutionWarnings });
}; 