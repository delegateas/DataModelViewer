import { AvoidLib } from 'libavoid-js';
import { g, util, mvc, dia } from '@joint/core';

const defaultPin = 1;

type Avoid = ReturnType<typeof AvoidLib.getInstance>;

interface AvoidRouterOptions {
    shapeBufferDistance?: number;
    portOverflow?: number;
    idealNudgingDistance?: number;
    commitTransactions?: boolean;
}

export class AvoidRouter {
    graph: dia.Graph;
    connDirections: Record<string, number>;
    shapeRefs: Record<string, any>;
    edgeRefs: Record<string, any>;
    pinIds: Record<string, number>;
    linksByPointer: Record<string, dia.Link>;
    avoidRouter: any;
    avoidConnectorCallback: (ptr: any) => void;
    id: number;
    margin!: number;
    portOverflow!: number;
    commitTransactions: boolean;
    graphListener?: mvc.Listener<any>;

    static async load(): Promise<void> {
        await AvoidLib.load("/libavoid.wasm");
    }

    constructor(graph: dia.Graph, options: AvoidRouterOptions = {}) {
        const Avoid = AvoidLib.getInstance();

        this.graph = graph;

        this.connDirections = {
            top: Avoid.ConnDirUp,
            right: Avoid.ConnDirRight,
            bottom: Avoid.ConnDirDown,
            left: Avoid.ConnDirLeft,
            all: Avoid.ConnDirAll,
        };

        this.shapeRefs = {};
        this.edgeRefs = {};
        this.pinIds = {};
        this.linksByPointer = {};
        this.avoidConnectorCallback = this.onAvoidConnectorChange.bind(this);
        this.id = 100000;
        this.commitTransactions = options.commitTransactions ?? true;

        this.createAvoidRouter(options);
    }

    createAvoidRouter(options: AvoidRouterOptions = {}) {
        const {
            shapeBufferDistance = 0,
            portOverflow = 0,
            idealNudgingDistance = 10,
        } = options;

        this.margin = shapeBufferDistance;
        this.portOverflow = portOverflow;

        const Avoid = AvoidLib.getInstance();
        const router = new Avoid.Router(Avoid.OrthogonalRouting);

        router.setRoutingParameter(Avoid.idealNudgingDistance, idealNudgingDistance);
        router.setRoutingParameter(Avoid.shapeBufferDistance, shapeBufferDistance);
        router.setRoutingOption(Avoid.nudgeOrthogonalTouchingColinearSegments, false);
        router.setRoutingOption(Avoid.performUnifyingNudgingPreprocessingStep, true);
        router.setRoutingOption(Avoid.nudgeSharedPathsWithCommonEndPoint, true);
        router.setRoutingOption(Avoid.nudgeOrthogonalSegmentsConnectedToShapes, true);

        this.avoidRouter = router;
    }

    getAvoidRectFromElement(element: dia.Element): any {
        const Avoid = AvoidLib.getInstance();
        const { x, y, width, height } = element.getBBox();
        return new Avoid.Rectangle(
            new Avoid.Point(x, y),
            new Avoid.Point(x + width, y + height)
        );
    }

    getVerticesFromAvoidRoute(route: any): Array<{ x: number; y: number }> {
        const vertices: Array<{ x: number; y: number }> = [];
        for (let i = 1; i < route.size() - 1; i++) {
            const { x, y } = route.get_ps(i);
            vertices.push({ x, y });
        }
        return vertices;
    }

    updateShape(element: dia.Element): void {
        const Avoid = AvoidLib.getInstance();
        const shapeRect = this.getAvoidRectFromElement(element);

        if (this.shapeRefs[element.id]) {
            this.avoidRouter.moveShape(this.shapeRefs[element.id], shapeRect);
            return;
        }

        const shapeRef = new Avoid.ShapeRef(this.avoidRouter, shapeRect);
        this.shapeRefs[element.id] = shapeRef;

        const centerPin = new Avoid.ShapeConnectionPin(
            shapeRef,
            defaultPin,
            0.5,
            0.5,
            true,
            0,
            Avoid.ConnDirAll
        );
        centerPin.setExclusive(false);

        element.getPortGroupNames().forEach((group: string) => {
            const portsPositions = element.getPortsPositions(group);
            const { width, height } = element.size();
            const rect = new g.Rect(0, 0, width, height);
            Object.keys(portsPositions).forEach((portId: string) => {
                const { x, y } = portsPositions[portId];
                const side = rect.sideNearestToPoint({ x, y });
                const pin = new Avoid.ShapeConnectionPin(
                    shapeRef,
                    this.getConnectionPinId(element.id.toString(), portId),
                    x / width,
                    y / height,
                    true,
                    0,
                    this.connDirections[side]
                );
                pin.setExclusive(false);
            });
        });
    }

    getConnectionPinId(elementId: dia.Cell.ID, portId: string): number {
        const pinKey = `${elementId}:${portId}`;
        if (pinKey in this.pinIds) return this.pinIds[pinKey];
        const pinId = this.id++;
        this.pinIds[pinKey] = pinId;
        return pinId;
    }

    updateConnector(link: dia.Link): any {
        const Avoid = AvoidLib.getInstance();

        const { id: sourceId, port: sourcePortId = null } = link.source();
        const { id: targetId, port: targetPortId = null } = link.target();

        if (!sourceId || !targetId) {
            this.deleteConnector(link);
            return null;
        }

        const sourceConnEnd = new Avoid.ConnEnd(
            this.shapeRefs[sourceId],
            sourcePortId ? this.getConnectionPinId(sourceId, sourcePortId) : defaultPin
        );

        const targetConnEnd = new Avoid.ConnEnd(
            this.shapeRefs[targetId],
            targetPortId ? this.getConnectionPinId(targetId, targetPortId) : defaultPin
        );

        let connRef = this.edgeRefs[link.id];

        if (!connRef) {
            connRef = new Avoid.ConnRef(this.avoidRouter);
            this.linksByPointer[connRef.g] = link;
            this.edgeRefs[link.id] = connRef;
            connRef.setCallback(this.avoidConnectorCallback, connRef);
        }

        connRef.setSourceEndpoint(sourceConnEnd);
        connRef.setDestEndpoint(targetConnEnd);

        return connRef;
    }

    deleteConnector(link: dia.Link): void {
        const connRef = this.edgeRefs[link.id];
        if (!connRef) return;
        this.avoidRouter.deleteConnector(connRef);
        delete this.linksByPointer[connRef.g];
        delete this.edgeRefs[link.id];
    }

    deleteShape(element: dia.Element): void {
        const shapeRef = this.shapeRefs[element.id];
        if (!shapeRef) return;
        this.avoidRouter.deleteShape(shapeRef);
        delete this.shapeRefs[element.id];
    }

    getLinkAnchorDelta(element: dia.Element, portId: string | null, point: g.Point): g.Point {
        let anchorPosition: g.Point;
        const bbox = element.getBBox();
        if (portId) {
            const port = element.getPort(portId);
            const portPosition = element.getPortsPositions(port.group || '')[portId];
            anchorPosition = element.position().offset(portPosition);
        } else {
            anchorPosition = bbox.center();
        }
        return point.difference(anchorPosition);
    }

    routeLink(link: dia.Link): void {
        const connRef = this.edgeRefs[link.id];
        if (!connRef) return;

        const route = connRef.displayRoute();
        const sourcePoint = new g.Point(route.get_ps(0));
        const targetPoint = new g.Point(route.get_ps(route.size() - 1));

        const { id: sourceId, port: sourcePortId = null } = link.source();
        const { id: targetId, port: targetPortId = null } = link.target();

        const sourceElement = link.getSourceElement();
        const targetElement = link.getTargetElement();

        if (!sourceElement || !targetElement) return;

        const sourceAnchorDelta = this.getLinkAnchorDelta(sourceElement, sourcePortId, sourcePoint);
        const targetAnchorDelta = this.getLinkAnchorDelta(targetElement, targetPortId, targetPoint);

        const linkAttributes: dia.Link.Attributes = {
            source: {
                id: sourceId,
                port: sourcePortId || null,
                anchor: { name: 'modelCenter', args: { dx: sourceAnchorDelta.x, dy: sourceAnchorDelta.y } },
            },
            target: {
                id: targetId,
                port: targetPortId || null,
                anchor: { name: 'modelCenter', args: { dx: targetAnchorDelta.x, dy: targetAnchorDelta.y } },
            },
        };

        if (this.isRouteValid(route, sourceElement, targetElement, sourcePortId, targetPortId)) {
            linkAttributes.vertices = this.getVerticesFromAvoidRoute(route);
            linkAttributes.router = null;
        } else {
            linkAttributes.vertices = [];
            linkAttributes.router = {
                name: 'rightAngle',
                args: {
                    margin: this.margin - this.portOverflow,
                },
            };
        }

        link.set(linkAttributes, { avoidRouter: true });
    }

    routeAll(): void {
        this.graph.getElements().forEach((element) => this.updateShape(element));
        this.graph.getLinks().forEach((link) => this.updateConnector(link));
        this.avoidRouter.processTransaction();
    }

    resetLink(link: dia.Link): void {
        const newAttributes = util.cloneDeep(link.attributes);
        newAttributes.vertices = [];
        newAttributes.router = null;
        delete newAttributes.source.anchor;
        delete newAttributes.target.anchor;
        link.set(newAttributes, { avoidRouter: true });
    }

    addGraphListeners(): void {
        this.removeGraphListeners();

        const listener = new mvc.Listener();
        listener.listenTo(this.graph, {
            remove: (cell: dia.Cell) => this.onCellRemoved(cell),
            add: (cell: dia.Cell) => this.onCellAdded(cell),
            change: (cell: dia.Cell, opt: any) => this.onCellChanged(cell, opt),
            reset: (_: any, opt: { previousModels: dia.Cell[] }) => this.onGraphReset(opt.previousModels),
        });

        this.graphListener = listener;
    }

    removeGraphListeners(): void {
        this.graphListener?.stopListening();
        delete this.graphListener;
    }

    onCellRemoved(cell: dia.Cell): void {
        if (cell.isElement()) {
            this.deleteShape(cell);
        } else {
            this.deleteConnector(cell as dia.Link);
        }
        this.avoidRouter.processTransaction();
    }

    onCellAdded(cell: dia.Cell): void {
        if (cell.isElement()) {
            this.updateShape(cell);
        } else {
            this.updateConnector(cell as dia.Link);
        }
        this.avoidRouter.processTransaction();
    }

    onCellChanged(cell: dia.Cell, opt: any): void {
        if (opt.avoidRouter) return;
        let needsRerouting = false;
        if ('source' in cell.changed || 'target' in cell.changed) {
            if (!cell.isLink()) return;
            if (!this.updateConnector(cell as dia.Link)) {
                this.resetLink(cell as dia.Link);
            }
            needsRerouting = true;
        }
        if ('position' in cell.changed || 'size' in cell.changed) {
            if (!cell.isElement()) return;
            this.updateShape(cell);
            needsRerouting = true;
        }

        if (this.commitTransactions && needsRerouting) {
            this.avoidRouter.processTransaction();
        }
    }

    onGraphReset(previousModels: dia.Cell[]): void {
        previousModels.forEach((cell) => {
            if (cell.isElement()) {
                this.deleteShape(cell);
            } else {
                this.deleteConnector(cell as dia.Link);
            }
        });

        this.routeAll();
    }

    onAvoidConnectorChange(connRefPtr: any): void {
        const link = this.linksByPointer[connRefPtr];
        if (!link) return;
        this.routeLink(link);
    }

    isRouteValid(
        route: any,
        sourceElement: dia.Element,
        targetElement: dia.Element,
        sourcePortId: string | null,
        targetPortId: string | null
    ): boolean {
        const size = route.size();
        if (size > 2) return true;

        const sourcePs = route.get_ps(0);
        const targetPs = route.get_ps(size - 1);

        if (sourcePs.x !== targetPs.x && sourcePs.y !== targetPs.y) {
            return false;
        }

        const margin = this.margin;

        if (
            sourcePortId &&
            targetElement.getBBox().inflate(margin).containsPoint(sourcePs)
        ) {
            return false;
        }

        if (
            targetPortId &&
            sourceElement.getBBox().inflate(margin).containsPoint(targetPs)
        ) {
            return false;
        }

        return true;
    }
}
