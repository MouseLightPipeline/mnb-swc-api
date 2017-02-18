const debug = require("debug")("ndb:swc-api:context");

import {PersistentStorageManager} from "../models/databaseConnector";
import {ITracing} from "../models/swc/tracing";
import {ITracingNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";

export interface IPageInfo {
    endCursor: string,
    hasNextPage: boolean;
}

export interface INodeEdge {
    node: ITracingNode,
    cursor: string;
}

export interface INodeConnections {
    totalCount: number;
    pageInfo: IPageInfo;
    edges: INodeEdge[];
}

export interface IGraphQLServerContext {
    getTracings(): Promise<ITracing[]>;
    getTracing(id: string): Promise<ITracing>;
    getStructureForTracing(tracing: ITracing): Promise<IStructureIdentifier>;
    getNodesForTracing(tracing: ITracing, first: number, count: number): Promise<ITracingNode[]>;
    getNodesConnectionForTracing(tracing, first: number, after: string): Promise<INodeConnections>;

    getTracingNodes(): Promise<ITracingNode[]>;
    getTracingNode(id: string): Promise<ITracingNode>;
    getTracingForNode(node: ITracingNode): Promise<ITracing>;
    getStructureForNode(node: ITracingNode): Promise<IStructureIdentifier>;

    getStructureIdentifiers(): Promise<IStructureIdentifier[]>;
    getStructureIdentifier(id: string): Promise<IStructureIdentifier>;
    getNodesForStructure(structure: IStructureIdentifier): Promise<ITracingNode[]>;
}

export class GraphQLServerContext implements IGraphQLServerContext {
    private _storageManager = PersistentStorageManager.Instance();

    public async getTracings(): Promise<ITracing[]> {
        return this._storageManager.Tracings.findAll({});
    }

    public async getTracing(id: string): Promise<ITracing> {
        return this._storageManager.Tracings.findById(id);
    }

    public async getStructureForTracing(tracing: ITracing): Promise<IStructureIdentifier> {
        const result = await this._storageManager.Tracings.findById(tracing.id);

        return result ? result.getStructureIdentifier() : [];
    }

    public async getNodesForTracing(tracing: ITracing, first: number, count: number): Promise<ITracingNode[]> {
        let offset = 0;
        let limit = 10;

        if (first) {
            offset = first - 1; // User-facing indexing is 1 based.
        }
        if (limit) {
            limit = count;
        }

        return this._storageManager.TracingNodes.findAll({
            where: {tracingId: tracing.id},
            order: [["sampleNumber", "ASC"]],
            offset: offset,
            limit: limit
        });
    }

    public async getNodesConnectionForTracing(tracing: ITracing, first: number, after: string): Promise<INodeConnections> {
        debug(first);
        debug(after);

        let offset = 0;
        let limit = 10;

        if (first) {
            limit = first;
        }

        if (after) {
            offset = decodeObj64(after)["offset"] + 1;
        }

        let count = await this._storageManager.TracingNodes.count({where: {tracingId: tracing.id}});

        let nodes = await this._storageManager.TracingNodes.findAll({
            where: {tracingId: tracing.id},
            order: [["sampleNumber", "ASC"]],
            offset: offset,
            limit: limit
        });

        return {
            totalCount: count,
            pageInfo: {
                endCursor: encodeObj64({offset: offset + limit - 1}),
                hasNextPage: offset + limit < count
            },
            edges: nodes.map((node, index) => {
                return {node: node, cursor: encodeObj64({offset: offset + index})}
            })
        }
    }

    public async getTracingNodes(): Promise<ITracingNode[]> {
        return this._storageManager.TracingNodes.findAll({});
    }

    public async getTracingNode(id: string): Promise<ITracingNode> {
        return this._storageManager.TracingNodes.findById(id);
    }

    public async getTracingForNode(node: ITracingNode): Promise<ITracing> {
        return this.getTracing(node.tracingId)
    }

    public async getStructureForNode(node: ITracingNode): Promise<IStructureIdentifier> {
        const result = await this._storageManager.TracingNodes.findById(node.id);

        return result ? result.getStructureIdentifier() : [];
    }

    public async getStructureIdentifiers(): Promise<IStructureIdentifier[]> {
        return this._storageManager.StructureIdentifiers.findAll({});
    }

    public async getStructureIdentifier(id: string): Promise<IStructureIdentifier> {
        return this._storageManager.StructureIdentifiers.findById(id);
    }

    public async getNodesForStructure(structure: IStructureIdentifier): Promise<ITracingNode[]> {
        const result = await this._storageManager.StructureIdentifiers.findById(structure.id);

        return result ? result.getNodes() : [];
    }
}

function encodeObj64(obj: any) {
    return encode64(JSON.stringify(obj));
}

function decodeObj64(str: string) {
    return JSON.parse(decode64(str));
}

function encode64(str: string) {
    return (new Buffer(str, 'ascii')).toString('base64');
}

function decode64(str: string) {
    return (new Buffer(str, 'base64')).toString('ascii');
}