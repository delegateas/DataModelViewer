import { Groups } from '../../generated/Data';

self.onmessage = function() {
    self.postMessage(Groups);
}; 