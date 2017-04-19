import {transformClient} from "./transformGraphQLClient";
const debug = require("debug")("ndb:swc-api:context");

import {IUploadFile} from "./middleware/schema";

import {swcParse} from "../Swc";

import {PersistentStorageManager} from "../models/databaseConnector";
import {ISwcTracing, ISwcTracingInput} from "../models/swc/tracing";
import {ISwcNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";
import {ISample} from "../models/sample/sample";
import {INeuron} from "../models/sample/neuron";
import {IInjection} from "../models/sample/injection";
import {IInjectionVirus} from "../models/sample/InjectionVirus";
import {IFluorophore} from "../models/sample/fluorophore";
import {IBrainArea} from "../models/sample/brainArea";
import {IMouseStrain} from "../models/sample/mousestrain";
import {ITracingStructure} from "../models/swc/tracingStructure";
import {IRegistrationTransform} from "../models/sample/registrationTransform";

export interface ISwcTracingPageInput {
    offset: number;
    limit: number;
    sampleId: string;
    neuronId: string;
    tracingStructureId: string;
    annotator: string;
    filename: string;
}

export interface ISwcTracingPage {
    offset: number;
    limit: number;
    totalCount: number;
    matchCount: number;
    tracings: ISwcTracing[];
}

export interface IUploadOutput {
    tracing: ISwcTracing;
    transformSubmission: boolean;
    error: Error;
}

export interface IQueryTracingsForSwcOutput {
    count: number;
    error: Error;
}

export interface IUpdateSwcTracingOutput {
    tracing: ISwcTracing;
    error: Error;
}

export interface IDeleteSwcTracingOutput {
    error: Error;
}

export interface IGraphQLServerContext {
    attachedFiles;

    // Query
    getMouseStrains(): Promise<IMouseStrain[]>;
    getMouseStrain(id: string): Promise<IMouseStrain>;

    getInjections(): Promise<IInjection[]>;
    getInjection(id: string): Promise<IInjection>;
    getInjectionsForSample(sample: ISample): Promise<IInjection[]>;

    getVirusForInjection(injection: IInjection): Promise<IInjectionVirus>;

    getFluorophoreForInjection(injection: IInjection): Promise<IFluorophore>;

    getBrainAreaForInjection(injection: IInjection): Promise<IBrainArea>;
    getBrainAreaForNeuron(neuron: INeuron): Promise<IBrainArea>;

    getRegistrationTransform(id: string): Promise<IRegistrationTransform>;

    getSamples(): Promise<ISample[]>;
    getSample(id: string): Promise<ISample>;

    getNeuron(id: string): Promise<INeuron>;
    getNeurons(sampleId: string): Promise<INeuron[]>;
    getNeuronsForInjection(injection: IInjection): Promise<INeuron[]>;

    getTracings(pageInput: ISwcTracingPageInput): Promise<ISwcTracingPage>;
    getTracing(id: string): Promise<ISwcTracing>;
    getStructureForTracing(tracing: ISwcTracing): Promise<IStructureIdentifier>;
    getNodeCount(tracing: ISwcTracing): Promise<number>;

    getTracingNodes(): Promise<ISwcNode[]>;
    getTracingNode(id: string): Promise<ISwcNode>;
    getTracingForNode(node: ISwcNode): Promise<ISwcTracing>;
    getStructureForNode(node: ISwcNode): Promise<IStructureIdentifier>;

    getStructureIdentifiers(): Promise<IStructureIdentifier[]>;
    getStructureIdentifier(id: string): Promise<IStructureIdentifier>;
    getNodesForStructure(structure: IStructureIdentifier): Promise<ISwcNode[]>;

    getTracingStructures(): Promise<ITracingStructure[]>;

    // Mutation
    transformedTracingsForSwc(id: String): Promise<IQueryTracingsForSwcOutput>
    receiveSwcUpload(annotator: string, neuronId: string, structureIdentifierId: string): Promise<IUploadOutput>;
    updateTracing(tracingInput: ISwcTracingInput): Promise<IUpdateSwcTracingOutput>;
    deleteTracing(id: string): Promise<IDeleteSwcTracingOutput>;
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
        return this._storageManager.Samples.findAll({order: [["idNumber", "ASC"]]});
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
        if (!sample || !sample.id || sample.id.length === 0) {
            return [];
        }

        return this._storageManager.Injections.findAll({
            where: {sampleId: sample.id}
        });
    }

    public async getInjections(): Promise<IInjection[]> {
        return this._storageManager.Injections.findAll({});
    }

    public async getInjection(id: string): Promise<IInjection> {
        return this._storageManager.Injections.findById(id);
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

    public async getRegistrationTransform(id: string): Promise<IRegistrationTransform> {
        return this._storageManager.RegistrationTransforms.findById(id);
    }

    public async getNeuron(id: string): Promise<INeuron> {
        return this._storageManager.Neurons.findById(id);
    }

    public async getNeurons(sampleId: string): Promise<INeuron[]> {
        if (!sampleId || sampleId.length === 0) {
            return this._storageManager.Neurons.findAll({});
        }

        const injectionIds = (await this._storageManager.Injections.findAll({where: {sampleId: sampleId}})).map(obj => obj.id);

        return this._storageManager.Neurons.findAll({
            where: {injectionId: {$in: injectionIds}},
            order: [["idString", "ASC"]]
        });
    }

    public async getBrainAreaForNeuron(neuron: INeuron): Promise<IBrainArea> {
        const result = await this._storageManager.Neurons.findById(neuron.id);

        return result ? result.getBrainArea() : [];
    }

    public async getTracingStructures(): Promise<ITracingStructure[]> {
        return this._storageManager.TracingStructures.findAll({});
    }

    public async getTracings(queryInput: ISwcTracingPageInput): Promise<ISwcTracingPage> {
        let out: ISwcTracingPage = {
            offset: 0,
            limit: 0,
            totalCount: 0,
            matchCount: 0,
            tracings: []
        };

        out.totalCount = await this._storageManager.SwcTracings.count({});

        let options = {where: {}};

        if (queryInput) {
            if (queryInput.tracingStructureId) {
                options.where["tracingStructureId"] = queryInput.tracingStructureId;
            }

            out.matchCount = await this._storageManager.SwcTracings.count(options);

            options["order"] = [["createdAt", "DESC"]];

            if (queryInput.offset) {
                options["offset"] = queryInput.offset;
                out.offset = queryInput.offset;
            }

            if (queryInput.limit) {
                options["limit"] = queryInput.limit;
                out.limit = queryInput.limit;
            }
        } else {
            out.matchCount = out.totalCount;
        }

        if (out.limit === 1) {
            out.tracings = await this._storageManager.SwcTracings.findOne(options);
        } else {
            out.tracings = await this._storageManager.SwcTracings.findAll(options);
        }
        return out;
    }

    public async getTracing(id: string): Promise<ISwcTracing> {
        return this._storageManager.SwcTracings.findById(id);
    }

    public async getStructureForTracing(tracing: ISwcTracing): Promise<ITracingStructure> {
        const result: ISwcTracing = await this._storageManager.SwcTracings.findById(tracing.id);

        return result ? result.getTracingStructure() : null;
    }

    public async getNodeCount(tracing: ISwcTracing): Promise<number> {
        if (!tracing || !tracing.id) {
            return 0;
        }

        return this._storageManager.SwcNodes.count({where: {swcTracingId: tracing.id}});
    }

    // TODO Unused - for reference
    public async getNodesForTracing(tracing: ISwcTracing, first: number, count: number): Promise<ISwcNode[]> {
        let offset = 0;
        let limit = 10;

        if (first) {
            offset = first - 1; // User-facing indexing is 1 based.
        }
        if (limit) {
            limit = count;
        }

        return this._storageManager.SwcNodes.findAll({
            where: {tracingId: tracing.id},
            order: [["sampleNumber", "ASC"]],
            offset: offset,
            limit: limit
        });
    }

    // TODO Unused - for reference
    public async getNodesConnectionForTracing(tracing: ISwcTracing, first: number, after: string): Promise<any> {
        let offset = 0;
        let limit = 10;

        if (first) {
            limit = first;
        }

        if (after) {
            offset = decodeObj64(after)["offset"] + 1;
        }

        let count = await this._storageManager.SwcNodes.count({where: {tracingId: tracing.id}});

        let nodes = await this._storageManager.SwcNodes.findAll({
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

    public async getTracingNodes(): Promise<ISwcNode[]> {
        return this._storageManager.SwcNodes.findAll({});
    }

    public async getTracingNode(id: string): Promise<ISwcNode> {
        return this._storageManager.SwcNodes.findById(id);
    }

    public async getTracingForNode(node: ISwcNode): Promise<ISwcTracing> {
        return this.getTracing(node.swcTracingId)
    }

    public async getStructureForNode(node: ISwcNode): Promise<IStructureIdentifier> {
        const result = await this._storageManager.SwcNodes.findById(node.id);

        return result ? result.getStructureIdentifier() : [];
    }

    public async getStructureIdentifiers(): Promise<IStructureIdentifier[]> {
        return this._storageManager.StructureIdentifiers.findAll({});
    }

    public async getStructureIdentifier(id: string): Promise<IStructureIdentifier> {
        return this._storageManager.StructureIdentifiers.findById(id);
    }

    public async getNodesForStructure(structure: IStructureIdentifier): Promise<ISwcNode[]> {
        const result = await this._storageManager.StructureIdentifiers.findById(structure.id);

        return result ? result.getNodes() : [];
    }

    public async receiveSwcUpload(annotator: string, neuronId: string, tracingStructureId: string): Promise<IUploadOutput> {
        if (!this.attachedFiles || this.attachedFiles.length === 0) {
            return {
                tracing: null,
                transformSubmission: false,
                error: {name: "UploadSwcError", message: "There are no files attached to parse"}
            };
        }

        if (!this.attachedFiles || this.attachedFiles.length > 1) {
            return {
                tracing: null,
                transformSubmission: false,
                error: {name: "UploadSwcError", message: "There are too many files attached to parse"}
            };
        }

        let file = this.attachedFiles[0];

        let tracing: ISwcTracing = null;

        let transformSubmission = false;

        try {

            const parseOutput = await swcParse(file);

            if (parseOutput.rows.length === 0) {
                return {
                    tracing: null,
                    transformSubmission: false,
                    error: {name: "UploadSwcError", message: "Could not find any identifiable node rows"}
                };
            }

            if (parseOutput.somaCount === 0) {
                return {
                    tracing: null,
                    transformSubmission: false,
                    error: {name: "UploadSwcError", message: "There are no soma/root/un-parented nodes in the tracing"}
                };
            }

            if (parseOutput.somaCount > 1) {
                return {
                    tracing: null,
                    transformSubmission: false,
                    error: {
                        name: "UploadSwcError",
                        message: "There is more than one soma/root/un-parented nodes in the tracing"
                    }
                };
            }

            const tracingData = {
                annotator,
                neuronId,
                tracingStructureId,
                filename: file.originalname,
                comments: parseOutput.comments,
                offsetX: parseOutput.janeliaOffsetX,
                offsetY: parseOutput.janeliaOffsetY,
                offsetZ: parseOutput.janeliaOffsetZ
            };

            let nodes: ISwcNode[] = parseOutput.rows.map(row => {
                return {
                    tracingId: "",
                    sampleNumber: row.sampleNumber,
                    structureIdentifierId: this._storageManager.StructureIdentifiers.idForValue(row.structure),
                    x: row.x,
                    y: row.y,
                    z: row.z,
                    radius: row.radius,
                    parentNumber: row.parentNumber
                }
            });

            await this._storageManager.SwcConnection.transaction(async (t) => {
                tracing = await this._storageManager.SwcTracings.create(tracingData, {transaction: t});

                nodes = nodes.map<ISwcNode>(node => {
                    node.swcTracingId = tracing.id;
                    return node;
                });

                return this._storageManager.SwcNodes.bulkCreate(nodes, {transaction: t});
            });

            debug(`inserted ${nodes.length} nodes from ${file.originalname}`);

            try {
                const out = await transformClient.transformTracing(tracing.id);
                transformSubmission = true;
                debug(`successfully submitted tracing for registration transform: ${out.data.applyTransform.tracing.id}`)
            } catch (error) {
                debug("transform submission failed");
                debug(error);
            }

        } catch (error) {
            return {tracing: null, transformSubmission: false, error};
        }

        return {tracing, transformSubmission, error: null};
    }

    public async updateTracing(tracingInput: ISwcTracingInput): Promise<IUpdateSwcTracingOutput> {
        try {
            let tracing = await this._storageManager.SwcTracings.findById(tracingInput.id);

            if (!tracing) {
                return {
                    tracing: null,
                    error: {name: "UpdateSwcError", message: "The tracing could not be found"}
                };
            }

            await tracing.update(tracingInput);

            const updatedTracing = await this._storageManager.SwcTracings.findById(tracingInput.id);

            return {tracing: updatedTracing, error: null};
        } catch (error) {
            return {tracing: null, error}
        }
    }

    public async transformedTracingsForSwc(id: String): Promise<IQueryTracingsForSwcOutput> {
        let tracing = await this._storageManager.SwcTracings.findById(id);

        if (!tracing) {
            return {count: -1, error: {name: "DoesNotExistError", message: "A tracing with that id does not exist"}};
        }

        try {
            const out = await transformClient.queryTracing(id);

            return {count: out.data.tracings.tracings.length, error: null};
        } catch (err) {
            debug(err);
            return {
                count: -1,
                error: {
                    name: "TransformApiError",
                    message: "Could not reach the server to count transformed tracings"
                }
            };
        }
    }

    public async deleteTracing(id: string): Promise<IDeleteSwcTracingOutput> {
        let tracing = await this._storageManager.SwcTracings.findById(id);

        if (!tracing) {
            return {error: {name: "DoesNotExistError", message: "A tracing with that id does not exist"}};
        }

        let out = null;

        try {
            out = await transformClient.queryTracing(id);

            let tracings: any[] = out.data.tracings.tracings;

            // Results could be unpredictable deleting while transform in progress
            if (tracings.length > 0) {
                if (tracings.some(t => t.transformStatus)) {
                    return {
                        error: {
                            name: "TransformInProgressError",
                            message: "A registration transform is in progress for the tracing - please wait for it to complete"
                        }
                    }
                }
                out = await transformClient.deleteTracings([out.data.tracings.tracings.map(t => t.id)]);

                if (out.data.deleteTracings.error) {
                    return {error: out.data.deleteTracings.error[0]};
                }
            }
        } catch (err) {
            debug(err);
            return {
                error: {
                    name: "TransformApiError",
                    message: "Could not reach the registered tracing server to verify usage"
                }
            };
        }

        try {
            let result = false;

            await this._storageManager.SwcConnection.transaction(async (t) => {
                await this._storageManager.SwcNodes.destroy({where: {swcTracingId: id}, transaction: t});

                let affectedRows = await this._storageManager.SwcTracings.destroy({where: {id: id}, transaction: t});

                result = affectedRows > 0
            });

        } catch (err) {
            debug(err);
            return {error: {name: err.name, message: err.message}};
        }

        return {error: null};
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