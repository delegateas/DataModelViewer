import { Groups, SolutionWarnings, Solutions } from '../../generated/Data';

self.onmessage = function() {
    self.postMessage({ groups: Groups, warnings: SolutionWarnings, solutions: Solutions });
}; 