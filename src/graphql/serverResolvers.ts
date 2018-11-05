import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

import {
    IDeleteSwcTracingOutput,
    GraphQLServerContext, IQueryTracingsForSwcOutput,
    ISwcTracingPage,
    ISwcTracingPageInput,
    IUpdateSwcTracingOutput,
    IUploadOutput, IUploadFile
} from "./serverContext";

import {ISwcTracingAttributes, ISwcTracingInput} from "../models/swc/tracing";
import {ISwcNodeAttributes} from "../models/swc/tracingNode";
import {IStructureIdentifierAttributes} from "../models/swc/structureIdentifier";
import {ITracingStructureAttributes} from "../models/swc/tracingStructure";
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

interface ITracingUploadArguments {
    annotator: string;
    neuronId: string;
    structureId: string;
    file: Promise<IUploadFile>;
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
        tracing(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<ISwcTracingAttributes> {
            return context.getTracing(args.id);
        },
        tracingNodes(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<ISwcNodeAttributes[]> {
            return context.getTracingNodes(args.id);
        },
        tracingNode(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<ISwcNodeAttributes> {
            return context.getTracingNode(args.id);
        },
        structureIdentifiers(_, __, context: GraphQLServerContext): Promise<IStructureIdentifierAttributes[]> {
            return context.getStructureIdentifiers();
        },
        structureIdentifier(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<IStructureIdentifierAttributes> {
            return context.getStructureIdentifier(args.id);
        },
        tracingStructures(_, __, context: GraphQLServerContext): Promise<ITracingStructureAttributes[]> {
            return context.getTracingStructures();
        },
        transformedTracingCount(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<IQueryTracingsForSwcOutput> {
            return context.transformedTracingCount(args.id);
        },
        systemMessage(): String {
            return systemMessage;
        }
    },
    Mutation: {
        async  uploadSwc(_, args: ITracingUploadArguments, context: GraphQLServerContext): Promise<IUploadOutput> {
            return context.receiveSwcUpload(args.annotator, args.neuronId, args.structureId, args.file);
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
        tracingStructure(tracing, _, context: GraphQLServerContext): Promise<ITracingStructureAttributes> {
            return context.getStructureForTracing(tracing);
        },
        neuron(tracing, _, context: GraphQLServerContext): Promise<INeuron> {
            return context.getNeuron(tracing.neuronId);
        }
    },
    SwcNode: {
        tracing(tracingNode, _, context: GraphQLServerContext): Promise<ISwcTracingAttributes> {
            return context.getTracingForNode(tracingNode);
        },
        structureIdentifier(tracingNode, _, context: GraphQLServerContext): Promise<IStructureIdentifierAttributes> {
            return context.getStructureForNode(tracingNode);
        }
    },
    StructureIdentifier: {
        nodes(structureIdentifier, _, context: GraphQLServerContext): Promise<ISwcNodeAttributes[]> {
            return context.getNodesForStructure(structureIdentifier);
        }
    },
    Date: new GraphQLScalarType({
        name: "Date",
        description: "Date custom scalar type",
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
    })
};

let systemMessage: String = "";

export default resolvers;
