const debug = require("debug")("ndb:swc-api:context");

import {IUploadFile} from "./middleware/schema";

import {swcParse} from "../Swc";

import {PersistentStorageManager} from "../models/databaseConnector";
import {ITracing} from "../models/swc/tracing";
import {ITracingNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";
import {ISample} from "../models/sample/sample";
import {INeuron} from "../models/sample/neuron";
import {IInjection} from "../models/sample/injection";
import {IInjectionVirus} from "../models/sample/InjectionVirus";
import {IFluorophore} from "../models/sample/fluorophore";
import {IBrainArea} from "../models/sample/brainArea";
import {IMouseStrain} from "../models/sample/mousestrain";

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
    attachedFiles;

    // Query
    getSamples(): Promise<ISample[]>;
    getSample(id: string): Promise<ISample>;
    getInjectionsForSample(sample: ISample): Promise<IInjection[]>;

    getMouseStrains(): Promise<IMouseStrain[]>;
    getMouseStrain(id: string): Promise<IMouseStrain>;

    getInjections(): Promise<IInjection[]>;
    getNeuronsForInjection(injection: IInjection): Promise<INeuron[]>;
    getVirusForInjection(injection: IInjection): Promise<IInjectionVirus>;
    getFluorophoreForInjection(injection: IInjection): Promise<IFluorophore>;
    getBrainAreaForInjection(injection: IInjection): Promise<IBrainArea>;

    getBrainAreaForNeuron(neuron: INeuron): Promise<IBrainArea>;

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

    // Mutation
    receiveSwcUpload(annotator: string, neuronId: string, structureIdentifierId: string);
}

export class GraphQLServerContext implements IGraphQLServerContext {
    private _storageManager = PersistentStorageManager.Instance();

    private _attachedFiles: IUploadFile[];

    public constructor(files = []) {
        this._attachedFiles = files;
    }

    public get attachedFiles() {
        return this._attachedFiles;
    }

    public async getSamples(): Promise<ISample[]> {
        return this._storageManager.Samples.findAll({});
    }

    public async getSample(id: string): Promise<ISample> {
        if (!id) {
            return null;
        }

        return await this._storageManager.Samples.findById(id);
    }

    public async getMouseStrains(): Promise<IMouseStrain[]> {
        return this._storageManager.MouseStrains.findAll({});
    }

    public async getMouseStrain(id: string): Promise<IMouseStrain> {
        return this._storageManager.MouseStrains.findById(id);
    }

   public async getInjectionsForSample(sample: ISample): Promise<IInjection[]> {
        return this._storageManager.Injections.findAll({
            where: {sampleId: sample.id}
        });
    }

    public async getInjections(): Promise<IInjection[]> {
        return this._storageManager.Injections.findAll({});
    }

    public async getNeuronsForInjection(injection: IInjection): Promise<INeuron[]> {
        const result = await this._storageManager.Injections.findById(injection.id);

        return result ? result.getNeurons() : [];
    }

    public async getVirusForInjection(injection: IInjection): Promise<IInjectionVirus> {
        const result = await this._storageManager.Injections.findById(injection.id);

        return result ? result.getInjectionVirus() : [];
    }

    public async getFluorophoreForInjection(injection: IInjection): Promise<IFluorophore> {
        const result = await this._storageManager.Injections.findById(injection.id);

        return result ? result.getFluorophore() : [];
    }

    public async getBrainAreaForInjection(injection: IInjection): Promise<IBrainArea> {
        const result = await this._storageManager.Injections.findById(injection.id);

        return result ? result.getBrainArea() : [];
    }

    public async getBrainAreaForNeuron(neuron: INeuron): Promise<IBrainArea> {
        const result = await this._storageManager.Neurons.findById(neuron.id);

        return result ? result.getBrainArea() : [];
    }

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

    public async receiveSwcUpload(annotator: string, neuronId: string, structureIdentifierId: string): Promise<boolean> {
        if (!this.attachedFiles || this.attachedFiles.length === 0) {
            return false;
        }

        const structureMap = await this._storageManager.StructureIdentifiers.getMap();

        const promises = this.attachedFiles.map(async(file) => {

            const parseOutput = await swcParse(file);

            if (parseOutput.rows.length === 0) {
                debug(`${file.originalname} did not contain any identifiable rows`);
                return;
            }

            const tracingData = {
                annotator: annotator,
                neuronId: neuronId,
                structureIdentifierId: structureIdentifierId,
                filename: file.originalname,
                comments: parseOutput.comments,
                offsetX: parseOutput.janeliaOffsetX,
                offsetY: parseOutput.janeliaOffsetY,
                offsetZ: parseOutput.janeliaOffsetZ
            };

            let nodes: ITracingNode[] = parseOutput.rows.map(row => {
                return {
                    tracingId: "",
                    sampleNumber: row.sampleNumber,
                    structureIdentifierId: structureMap[row.structure],
                    x: row.x,
                    y: row.y,
                    z: row.z,
                    radius: row.radius,
                    parentNumber: row.parentNumber
                }
            });

            await this._storageManager.SwcConnection.transaction(async(t) => {
                let tracing = await this._storageManager.Tracings.create(tracingData, {transaction: t});

                nodes = nodes.map<ITracingNode>(node => {
                    node.tracingId = tracing.id;
                    return node;
                });

                return this._storageManager.TracingNodes.bulkCreate(nodes, {transaction: t});
            });

            debug(`inserted ${nodes.length} nodes from ${file.originalname}`);
        });

        await Promise.all(promises);

        return true;
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