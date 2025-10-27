import { dia } from "@joint/core";
import { AvoidRouter } from "./avoidrouter";
import { RouterResponseEvent, RouterRequestEvent } from "./events";

export async function initializeRouter(graph: dia.Graph, paper: dia.Paper) {
    await AvoidRouter.load();
    const routerWorker = new Worker(new URL("./../worker-thread/worker.ts", import.meta.url));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routerWorker.onmessage = (event: { data: { command: RouterResponseEvent, cells: any[] } }) => {
        const { command, ...data } = event.data;
        switch (command) {
            case RouterResponseEvent.Routed:
                const { cells } = data;
                cells.forEach((cell) => {
                    const model = graph.getCell(cell.id);
                    if (model && !model.isElement()) {
                        model.set({
                            vertices: cell.vertices,
                            source: cell.source,
                            target: cell.target,
                            router: null
                        }, {
                            fromWorker: true
                        });
                    }
                });
                break;
            default:
                console.warn('Unknown response command', command);
                break;
        }
    };

    // Send initial reset with current graph state
    routerWorker.postMessage({
        command: RouterRequestEvent.Reset,
        cells: graph.toJSON().cells
    });

    // Register graph event listeners (outside of other event handlers)
    graph.on('change', (cell, opt) => {
        if (opt.fromWorker) {
            return;
        }

        // Only send relevant changes to avoid spam
        if (cell.isElement() && (cell.hasChanged('position') || cell.hasChanged('size'))) {
            routerWorker.postMessage({
                command: RouterRequestEvent.Change,
                cell: cell.toJSON()
            });

            const links = graph.getConnectedLinks(cell);
            links.forEach((link) => {
                if (!link.router()) {
                    link.router('rightAngle');
                }
            });
        } else if (!cell.isElement() && (cell.hasChanged('source') || cell.hasChanged('target') || cell.hasChanged('vertices'))) {
            // Only send link changes for source, target, or vertices
            routerWorker.postMessage({
                command: RouterRequestEvent.Change,
                cell: cell.toJSON()
            });
        }
    });

    graph.on('remove', (cell) => {
        routerWorker.postMessage({
            command: RouterRequestEvent.Remove,
            id: cell.id
        });
    });

    graph.on('add', (cell) => {
        routerWorker.postMessage({
            command: RouterRequestEvent.Add,
            cell: cell.toJSON()
        });
    });

    paper.on('link:snap:connect', (linkView) => {
        linkView.model.router('rightAngle');
    });

    paper.on('link:snap:disconnect', (linkView) => {
        linkView.model.set({
            vertices: [],
            router: null
        });
    });
}