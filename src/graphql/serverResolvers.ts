import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const debug = require("debug")("mnb:swc-api:resolvers");

import {
    IDeleteSwcTracingOutput,
    GraphQLServerContext, IQueryTracingsForSwcOutput,
    ISwcTracingPage,
    ISwcTracingPageInput,
    IUpdateSwcTracingOutput,
    IUploadOutput, IUploadFile
} from "./serverContext";

import {ISwcTracing, ISwcTracingInput} from "../models/swc/tracing";
import {ISwcNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";
import {ITracingStructure} from "../models/swc/tracingStructure";
import {ISample} from "../models/sample/sample";
import {IMouseStrain} from "../models/sample/mouseStrain";
import {INeuron} from "../models/sample/neuron";
import {IInjection} from "../models/sample/injection";
import {IBrainArea} from "../models/sample/brainArea";
import {IInjectionVirus} from "../models/sample/injectionVirus";
import {IFluorophore} from "../models/sample/fluorophore";
import {ITransform} from "../models/sample/transform";

interface IIdOnlyArguments {
    id: string;
}

interface IIdsArguments {
    ids: string[];
}

interface INeuronIdsArguments {
    neuronIds: string[];
}

interface ISampleIdArguments {
    sampleId: string;
}

interface ITracingsArguments {
    pageInput: ISwcTracingPageInput;
}


interface ITracingUpdateSwcArguments {
    id: string;
    files: Promise<IUploadFile>[];
}

interface ITracingUploadArguments {
    annotator: string;
    neuronId: string;
    structureId: string;
    files: Promise<IUploadFile>[];
}

interface IUpdateTracingArguments {
    tracing: ISwcTracingInput;
}

const resolvers = {
    Query: {
        samples(_, __, context: GraphQLServerContext): Promise<ISample[]> {
            return context.getSamples();
        },
        sample(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<ISample> {
            return context.getSample(args.id);
        },
        mouseStrains(_, __, context: GraphQLServerContext): Promise<IMouseStrain[]> {
            return context.getMouseStrains();
        },
        mouseStrain(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<IMouseStrain> {
            return context.getMouseStrain(args.id);
        },
        neurons(_, args: ISampleIdArguments, context: GraphQLServerContext): Promise<INeuron[]> {
            return context.getNeurons(args.sampleId);
        },
        injections(_, __, context: GraphQLServerContext): Promise<IInjection[]> {
            return context.getInjections();
        },
        tracings(_, args: ITracingsArguments, context: GraphQLServerContext): Promise<ISwcTracingPage> {
            return context.getTracings(args.pageInput);
        },
        tracing(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<ISwcTracing> {
            return context.getTracing(args.id);
        },
        tracingNodes(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<ISwcNode[]> {
            return context.getTracingNodes(args.id);
        },
        tracingNode(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<ISwcNode> {
            return context.getTracingNode(args.id);
        },
        structureIdentifiers(_, __, context: GraphQLServerContext): Promise<IStructureIdentifier[]> {
            return context.getStructureIdentifiers();
        },
        structureIdentifier(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureIdentifier(args.id);
        },
        tracingStructures(_, __, context: GraphQLServerContext): Promise<ITracingStructure[]> {
            return context.getTracingStructures();
        },
        systemMessage(): String {
            return systemMessage;
        }
    },
    Mutation: {
        async  uploadSwc(_, args: ITracingUploadArguments, context: GraphQLServerContext): Promise<IUploadOutput> {
            return context.receiveSwcUpload(args.annotator, args.neuronId, args.structureId, args.files);
        },
        async updateSwc(_, args: ITracingUpdateSwcArguments, context: GraphQLServerContext): Promise<IUploadOutput> {
            return context.receiveSwcUpdate(args.id, args.files);
        },
        transformedTracingsForSwc(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<IQueryTracingsForSwcOutput> {
            return context.transformedTracingsForSwc(args.id);
        },

        updateTracing(_, args: IUpdateTracingArguments, context: GraphQLServerContext): Promise<IUpdateSwcTracingOutput> {
            return context.updateTracing(args.tracing);
        },
        deleteTracing(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<IDeleteSwcTracingOutput> {
            return context.deleteTracing(args.id);
        },
        deleteTracings(_, args: IIdsArguments, context: GraphQLServerContext): Promise<IDeleteSwcTracingOutput[]> {
            return context.deleteTracings(args.ids);
        },
        deleteTracingsForNeurons(_, args: INeuronIdsArguments, context: GraphQLServerContext): Promise<IDeleteSwcTracingOutput[]> {
            return context.deleteTracingsForNeurons(args.neuronIds);
        },

        setSystemMessage(_, args: any): boolean {
            systemMessage = args.message;

            return true;
        },
        clearSystemMessage(): boolean {
            systemMessage = "";

            return true;
        }
    },
    Sample: {
        injections(sample, _, context: GraphQLServerContext): Promise<IInjection[]> {
            if (!sample || !sample.id || sample.id.length === 0) {
                return null;
            }

            return context.getInjectionsForSample(sample);
        },
        mouseStrain(sample, _, context: GraphQLServerContext): Promise<IMouseStrain> {
            if (!sample || !sample.mouseStrainId || sample.mouseStrainId.length === 0) {
                return null;
            }

            return context.getMouseStrain(sample.mouseStrainId);
        },
        activeRegistrationTransform(sample, _, context: GraphQLServerContext): Promise<ITransform> {
            if (!sample || !sample.activeRegistrationId || sample.activeRegistrationId.length === 0) {
                return null;
            }

            return context.getRegistrationTransform(sample.activeRegistrationId);
        }
    },
    Neuron: {
        brainArea(neuron, _, context: GraphQLServerContext): Promise<IBrainArea> {
            return context.getBrainAreaForNeuron(neuron);
        },
        injection(neuron, _, context: GraphQLServerContext): Promise<IInjection> {
            return context.getInjection(neuron.injectionId);
        }
    },
    Injection: {
        neurons(injection, _, context: GraphQLServerContext): Promise<INeuron[]> {
            return context.getNeuronsForInjection(injection);
        },
        injectionVirus(injection, _, context: GraphQLServerContext): Promise<IInjectionVirus> {
            return context.getVirusForInjection(injection);
        },
        fluorophore(injection, _, context: GraphQLServerContext): Promise<IFluorophore> {
            return context.getFluorophoreForInjection(injection);
        },
        brainArea(injection, _, context: GraphQLServerContext): Promise<IBrainArea> {
            return context.getBrainAreaForInjection(injection);
        }
    },
    SwcTracing: {
        nodeCount(tracing, __, context: GraphQLServerContext): Promise<number> {
            return context.getNodeCount(tracing);
        },
        tracingStructure(tracing, _, context: GraphQLServerContext): Promise<ITracingStructure> {
            return context.getStructureForTracing(tracing);
        },
        neuron(tracing, _, context: GraphQLServerContext): Promise<INeuron> {
            return context.getNeuron(tracing.neuronId);
        }
    },
    SwcNode: {
        tracing(tracingNode, _, context: GraphQLServerContext): Promise<ISwcTracing> {
            return context.getTracingForNode(tracingNode);
        },
        structureIdentifier(tracingNode, _, context: GraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureForNode(tracingNode);
        },
        // structureIdValue(node: ISwcNode, _, context: GraphQLServerContext): number {
        //     return context.getStructureIdValue(node.structureIdentifierId);
        // }
    },
    StructureIdentifier: {
        nodes(structureIdentifier, _, context: GraphQLServerContext): Promise<ISwcNode[]> {
            return context.getNodesForStructure(structureIdentifier);
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue: (value) => {
            return new Date(value); // value from the client
        },
        serialize: (value) => {
            return value.getTime(); // value sent to the client
        },
        parseLiteral: (ast) => {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    }),
    UploadedFile: new GraphQLScalarType({
        name: 'UploadedFile',
        description: 'Uploaded file',
        parseValue: value => value,
        serialize: value => value,
        parseLiteral: parseJSONLiteral
    })
};

function parseJSONLiteral(ast) {
    switch (ast.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
            return ast.value;
        case Kind.INT:
        case Kind.FLOAT:
            return parseFloat(ast.value);
        case Kind.OBJECT: {
            const value = Object.create(null);
            ast.fields.forEach(field => {
                value[field.name.value] = parseJSONLiteral(field.value);
            });

            return value;
        }
        case Kind.LIST:
            return ast.values.map(parseJSONLiteral);
        default:
            return null;
    }
}

let systemMessage: String = "";

export default resolvers;
