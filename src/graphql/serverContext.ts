import * as _ from "lodash";
import {Op} from "sequelize";

const debug = require("debug")("mnb:swc-api:context");

import {swcParse} from "../Swc";

import {transformClient} from "../external/transformApiClient";
import {Sample} from "../models/sample/sample";
import {StructureIdentifier} from "../models/swc/structureIdentifier";
import {ISwcTracingInput, SwcTracing} from "../models/swc/tracing";
import {MouseStrain} from "../models/sample/mouseStrain";
import {Injection} from "../models/sample/injection";
import {InjectionVirus} from "../models/sample/injectionVirus";
import {Neuron} from "../models/sample/neuron";
import {RegistrationTransform} from "../models/sample/transform";
import {BrainArea} from "../models/sample/brainArea";
import {Fluorophore} from "../models/sample/fluorophore";
import {TracingStructure} from "../models/swc/tracingStructure";
import {SwcNode, SwcNodeMutationData} from "../models/swc/tracingNode";

export interface IUploadFile {
    filename: string;
    encoding: string;
    mimetype: string;
    stream: any;
}

export interface ISwcTracingPageInput {
    offset: number;
    limit: number;
    neuronIds: string[];
    tracingStructureId: string;
}

export interface ISwcTracingPage {
    offset: number;
    limit: number;
    totalCount: number;
    matchCount: number;
    tracings: SwcTracing[];
}

export interface IUploadOutput {
    tracing: SwcTracing;
    transformSubmission: boolean;
    error: Error;
}

export interface ITracingsForSwcTracingCount {
    swcTracingId: string;
    count: number;
}


export interface IQueryTracingsForSwcOutput {
    counts: ITracingsForSwcTracingCount[];
    error: Error;
}

export interface IUpdateSwcTracingOutput {
    tracing: SwcTracing;
    error: Error;
}

export interface IDeleteSwcTracingOutput {
    id: string;
    error: Error;
}

export class GraphQLServerContext {
    public getStructureIdValue(id: string): number {
        return StructureIdentifier.valueForId(id);
    }

    public async getSamples(): Promise<Sample[]> {
        return Sample.findAll({order: [["idNumber", "ASC"]]});
    }

    public async getSample(id: string): Promise<Sample> {
        if (!id) {
            return null;
        }

        return Sample.findByPk(id);
    }

    public async getMouseStrains(): Promise<MouseStrain[]> {
        return MouseStrain.findAll({});
    }

    public async getMouseStrain(id: string): Promise<MouseStrain> {
        return MouseStrain.findByPk(id);
    }

    public async getInjectionsForSample(sample: Sample): Promise<Injection[]> {
        if (!sample || !sample.id || sample.id.length === 0) {
            return [];
        }

        return Injection.findAll({
            where: {sampleId: sample.id}
        });
    }

    public async getInjections(): Promise<Injection[]> {
        return Injection.findAll({});
    }

    public async getInjection(id: string): Promise<Injection> {
        return Injection.findByPk(id);
    }

    public async getNeuronsForInjection(injection: Injection): Promise<Neuron[]> {
        const result = await Injection.findByPk(injection.id);

        return result ? result.getNeurons() : [];
    }

    public async getVirusForInjection(injection: Injection): Promise<InjectionVirus> {
        const result = await Injection.findByPk(injection.id);

        return result ? result.getInjectionVirus() : null;
    }

    public async getFluorophoreForInjection(injection: Injection): Promise<Fluorophore> {
        const result = await Injection.findByPk(injection.id);

        return result ? result.getFluorophore() : null;
    }

    public async getBrainAreaForInjection(injection: Injection): Promise<BrainArea> {
        const result = await Injection.findByPk(injection.id);

        return result ? result.getBrainArea() : null;
    }

    public async getRegistrationTransform(id: string): Promise<RegistrationTransform> {
        return RegistrationTransform.findByPk(id);
    }

    public async getNeuron(id: string): Promise<Neuron> {
        return Neuron.findByPk(id);
    }

    public async getNeurons(sampleId: string): Promise<Neuron[]> {
        if (!sampleId || sampleId.length === 0) {
            return Neuron.findAll({});
        }

        const injectionIds = (await Injection.findAll({where: {sampleId: sampleId}})).map(obj => obj.id);

        return Neuron.findAll({
            where: {injectionId: {[Op.in]: injectionIds}},
            order: [["idString", "ASC"]]
        });
    }

    public async getBrainAreaForNeuron(neuron: Neuron): Promise<BrainArea> {
        const result = await Neuron.findByPk(neuron.id);

        return result ? result.getBrainArea() : null;
    }

    public async getTracingStructures(): Promise<TracingStructure[]> {
        return TracingStructure.findAll({});
    }

    public async getTracings(queryInput: ISwcTracingPageInput): Promise<ISwcTracingPage> {
        let out: ISwcTracingPage = {
            offset: 0,
            limit: 0,
            totalCount: 0,
            matchCount: 0,
            tracings: []
        };

        out.totalCount = await SwcTracing.count({});

        let options = {where: {}};

        if (queryInput) {
            if (queryInput.tracingStructureId) {
                options.where["tracingStructureId"] = queryInput.tracingStructureId;
            }

            if (queryInput.neuronIds && queryInput.neuronIds.length > 0) {
                options.where["neuronId"] = {[Op.in]: queryInput.neuronIds}
            }

            out.matchCount = await SwcTracing.count(options);

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
            out.tracings = [await SwcTracing.findOne(options)];
        } else {
            out.tracings = await SwcTracing.findAll(options);
        }

        return out;
    }

    public async getTracing(id: string): Promise<SwcTracing> {
        return SwcTracing.findByPk(id);
    }

    public async getStructureForTracing(tracing: SwcTracing): Promise<TracingStructure> {
        const result: SwcTracing = await SwcTracing.findByPk(tracing.id);

        return result ? result.getTracingStructure() : null;
    }

    public async getNodeCount(tracing: SwcTracing): Promise<number> {
        if (!tracing || !tracing.id) {
            return 0;
        }

        return SwcNode.count({where: {swcTracingId: tracing.id}});
    }

    // TODO Unused - for reference
    public async getNodesForTracing(tracing: SwcTracing, first: number, count: number): Promise<SwcNode[]> {
        let offset = 0;
        let limit = 10;

        if (first) {
            offset = first - 1; // User-facing indexing is 1 based.
        }
        if (limit) {
            limit = count;
        }

        return SwcNode.findAll({
            where: {swcTracingId: tracing.id},
            order: [["sampleNumber", "ASC"]],
            offset: offset,
            limit: limit
        });
    }

    // TODO Unused - for reference
    public async getNodesConnectionForTracing(tracing: SwcTracing, first: number, after: string): Promise<any> {
        let offset = 0;
        let limit = 10;

        if (first) {
            limit = first;
        }

        if (after) {
            offset = decodeObj64(after)["offset"] + 1;
        }

        let count = await SwcNode.count({where: {tracingId: tracing.id}});

        let nodes = await SwcNode.findAll({
            where: {swcTracingId: tracing.id},
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

    public async getTracingNodes(id: string): Promise<SwcNode[]> {
        let r = [];
        if (!id) {
            r = await SwcNode.findAll({});
        } else {
            r = await SwcNode.findAll({where: {swcTracingId: id}});
        }

        r = r.map(o => {
            o.structureIdValue = this.getStructureIdValue(o.structureIdentifierId);
            return o;
        });

        return r;
    }

    public async getTracingNode(id: string): Promise<SwcNode> {
        return SwcNode.findByPk(id);
    }

    public async getStructureForNode(node: SwcNode): Promise<StructureIdentifier> {
        const result: SwcNode = await SwcNode.findByPk(node.id);

        return result ? (await result.getStructureIdentifier()) : null;
    }

    public async getStructureIdentifiers(): Promise<StructureIdentifier[]> {
        return StructureIdentifier.findAll({});
    }

    public async getStructureIdentifier(id: string): Promise<StructureIdentifier> {
        return StructureIdentifier.findByPk(id);
    }

    public async getNodesForStructure(structure: StructureIdentifier): Promise<SwcNode[]> {
        const result = await StructureIdentifier.findByPk(structure.id);

        return result ? result.getNodes() : [];
    }

    public async receiveSwcUpload(annotator: string, neuronId: string, tracingStructureId: string, uploadFile: Promise<IUploadFile>): Promise<IUploadOutput> {
        if (!uploadFile) {
            return {
                tracing: null,
                transformSubmission: false,
                error: {name: "UploadSwcError", message: "There are no files attached to parse"}
            };
        }

        let file = await uploadFile;

        let tracing: SwcTracing = null;

        let transformSubmission = false;

        try {
            const parseOutput = await swcParse(file.stream);

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

            const tracingData: ISwcTracingInput = {
                annotator,
                neuronId,
                tracingStructureId,
                filename: file.filename,
                fileComments: parseOutput.comments,
                offsetX: parseOutput.janeliaOffsetX,
                offsetY: parseOutput.janeliaOffsetY,
                offsetZ: parseOutput.janeliaOffsetZ
            };

            let nodeData: SwcNodeMutationData[] = parseOutput.rows.map(row => {
                return {
                    swcTracingId: null,
                    sampleNumber: row.sampleNumber,
                    structureIdentifierId: StructureIdentifier.idForValue(row.structure),
                    x: row.x,
                    y: row.y,
                    z: row.z,
                    radius: row.radius,
                    parentNumber: row.parentNumber
                }
            });

            await SwcTracing.sequelize.transaction(async (t) => {
                tracing = await SwcTracing.create(tracingData, {transaction: t});

                nodeData = nodeData.map(node => {
                    node.swcTracingId = tracing.id;
                    return node;
                });

                return SwcNode.bulkCreate(nodeData, {transaction: t});
            });

            debug(`inserted ${nodeData.length} nodes from ${file.filename}`);

            try {
                // TODO out.data.applyTransform can return an error if the service is running but the registration file
                // can't be found or other similar issues.
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
            let tracing = await SwcTracing.findByPk(tracingInput.id);

            if (!tracing) {
                return {
                    tracing: null,
                    error: {name: "UpdateSwcError", message: "The tracing could not be found"}
                };
            }

            await tracing.update(tracingInput);

            const updatedTracing = await SwcTracing.findByPk(tracingInput.id);

            return {tracing: updatedTracing, error: null};
        } catch (error) {
            return {tracing: null, error}
        }
    }

    public async transformedTracingCount(ids: string[]): Promise<IQueryTracingsForSwcOutput> {
        try {
            const out = await transformClient.queryTracings(ids);

            const groups = _.groupBy(out.data.tracings.tracings, "swcTracing.id");

            const counts = [];

            if (ids.length === 0) {
                for (const id in groups) {
                    counts.push({
                        swcTracingId: id,
                        count: groups[id].length
                    });
                }
            } else {
                ids.map(id => {
                    counts.push({
                        swcTracingId: id,
                        count: groups[id] !== undefined ? groups[id].length : 0
                    });
                });
            }

            return {counts, error: null};
        } catch (err) {
            debug(err.message);
            return {counts: [], error: err};
        }

    }

    public async deleteTracing(id: string): Promise<IDeleteSwcTracingOutput> {
        let tracing = await SwcTracing.findByPk(id);

        if (!tracing) {
            return {id, error: {name: "DoesNotExistError", message: "A tracing with that id does not exist"}};
        }

        let out = null;

        try {
            out = await transformClient.deleteTracingsForSwc([id]);

            const errors = out.data.deleteTracingsForSwc.filter(r => r.error !== null);

            if (errors.length > 0) {
                return {id, error: errors[0].error};
            }
        } catch (err) {
            debug(err);
            return {
                id,
                error: {
                    name: "TransformApiError",
                    message: "Could not reach the registered tracing server to verify usage"
                }
            };
        }

        try {
            let result = false;

            await SwcNode.sequelize.transaction(async (t) => {
                await SwcNode.destroy({where: {swcTracingId: id}, transaction: t});

                let affectedRows = await SwcTracing.destroy({where: {id: id}, transaction: t});

                result = affectedRows > 0
            });

        } catch (err) {
            debug(err);
            return {id, error: {name: err.name, message: err.message}};
        }

        return {id, error: null};
    }


    public async deleteTracings(ids: string[]): Promise<IDeleteSwcTracingOutput[]> {
        if (!ids) {
            return null;
        }

        return Promise.all(ids.map((id => {
            return this.deleteTracing(id);
        })));
    }

    public async deleteTracingsForNeurons(ids: string[]): Promise<IDeleteSwcTracingOutput[]> {
        const tracingIds = (await SwcTracing.findAll({where: {neuronId: {[Op.in]: ids}}})).map(o => o.id);

        return this.deleteTracings(tracingIds);
    }
}

function encodeObj64(obj: any) {
    return encode64(JSON.stringify(obj));
}

function decodeObj64(str: string) {
    return JSON.parse(decode64(str));
}

function encode64(str: string) {
    return (new Buffer(str, "ascii")).toString("base64");
}

function decode64(str: string) {
    return (new Buffer(str, "base64")).toString("ascii");
}