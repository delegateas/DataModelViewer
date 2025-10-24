import { RelationshipLink } from "../../diagram-elements/RelationshipLink";
import { AvoidRouter } from "../shared/avoidrouter";
import { RouterRequestEvent } from "../shared/events";
import { dia, shapes, util } from "@joint/core";

const routerLoaded = AvoidRouter.load();

// Create simplified element definitions for worker context
// These don't need the full DOM functionality since they're just for routing
const WorkerEntityElement = dia.Element.define('diagram.EntityElement', {
    // Minimal definition just for the worker
    size: { width: 120, height: 80 },
    attrs: {
        // Simplified attributes without SVG parsing
        body: {
            width: 'calc(w)',
            height: 'calc(h)',
        }
    }
});

const WorkerSelectionElement = dia.Element.define('selection.SelectionElement', {
    size: { width: 100, height: 100 },
    attrs: {
        body: {
            width: 'calc(w)',
            height: 'calc(h)',
        }
    }
});

onmessage = async(e) => {
    await routerLoaded;

    console.log("Worker received message:", e.data);

    const { command, ...data } = e.data; // Remove array destructuring
    switch (command) {
        case RouterRequestEvent.Reset: {
            const { cells } = data;
            console.log("Resetting graph with", cells?.length, "cells");
            graph.resetCells(cells || [], { fromBrowser: true });
            router.routeAll();
            break;
        }
        case RouterRequestEvent.Change: {
            const { cell } = data;
            console.log("Changing cell:", cell.id);
            const model = graph.getCell(cell.id);
            if (!model) {
                console.warn(`Cell with id ${cell.id} not found in worker graph, skipping change event`);
                return;
            }
            if (model.isElement()) {
                model.set({
                    position: cell.position,
                    size: cell.size,
                }, {
                    fromBrowser: true
                });
            } else {
                model.set({
                    source: cell.source,
                    target: cell.target,
                    vertices: cell.vertices
                }, {
                    fromBrowser: true
                });
            }
            break;
        }
        case RouterRequestEvent.Remove: {
            const { id } = data;
            console.log("Removing cell:", id);
            const model = graph.getCell(id);
            if (!model) break;
            model.remove({ fromBrowser: true });
            break;
        }
        case RouterRequestEvent.Add: {
            const { cell } = data;
            console.log("Adding cell:", cell.id);
            graph.addCell(cell, { fromBrowser: true });
            break;
        }
        default:
            console.log('Unknown command', command);
            break;
    }
};

await routerLoaded;

const graph = new dia.Graph({}, { 
    cellNamespace: { 
        ...shapes, 
        diagram: { EntityElement: WorkerEntityElement, RelationshipLink }, 
        selection: { SelectionElement: WorkerSelectionElement } 
    } 
});

const router = new AvoidRouter(graph, {
    shapeBufferDistance: 20,
    idealNudgingDistance: 10,
    portOverflow: 8,
    commitTransactions: false
});

let changed: any = {};
let isProcessing = false;

const debouncedProcessTransaction = util.debounce(() => {
    if (isProcessing) return;
    isProcessing = true;
    
    router.avoidRouter.processTransaction();
    setTimeout(() => {
        postMessage({
            command: 'routed',
            cells: Object.values(changed),
        });
        changed = {};
        isProcessing = false;
    }, 0);
}, 100);

router.addGraphListeners();

graph.on('change', (cell, opt) => {
    if (opt.fromBrowser) {
        debouncedProcessTransaction();
        return;
    }
    changed[cell.id] = cell.toJSON();
});

graph.on('reset', (collection, opt) => {
    if (!opt.fromBrowser) return;
    debouncedProcessTransaction();
});

graph.on('add', (cell, opt) => {
    if (!opt.fromBrowser) return;
    debouncedProcessTransaction();
});

graph.on('remove', (cell, opt) => {
    delete changed[cell.id];
    if (!opt.fromBrowser) return;
    debouncedProcessTransaction();
});