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

import {ISwcTracingInput, SwcTracing} from "../models/swc/swcTracing";
import {Sample} from "../models/sample/sample";
import {MouseStrain} from "../models/sample/mouseStrain";
import {Neuron} from "../models/sample/neuron";
import {Injection} from "../models/sample/injection";
import {SwcNode} from "../models/swc/swcNode";
import {StructureIdentifier} from "../models/swc/structureIdentifier";
import {TracingStructure} from "../models/swc/tracingStructure";
import {InjectionVirus} from "../models/sample/injectionVirus";
import {Fluorophore} from "../models/sample/fluorophore";
import {BrainArea} from "../models/sample/brainArea";
import {RegistrationTransform} from "../models/sample/transform";

interface IIdOnlyArguments {
    id: string;
}

interface IIdsArguments {
    ids: string[];
}

interface NeuronIdsArguments {
    neuronIds: string[];
}

interface SampleIdArguments {
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
        samples(_, __, context: GraphQLServerContext): Promise<Sample[]> {
            return context.getSamples();
        },
        sample(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<Sample> {
            return context.getSample(args.id);
        },
        mouseStrains(_, __, context: GraphQLServerContext): Promise<MouseStrain[]> {
            return context.getMouseStrains();
        },
        mouseStrain(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<MouseStrain> {
            return context.getMouseStrain(args.id);
        },
        neurons(_, args: SampleIdArguments, context: GraphQLServerContext): Promise<Neuron[]> {
            return context.getNeurons(args.sampleId);
        },
        injections(_, __, context: GraphQLServerContext): Promise<Injection[]> {
            return context.getInjections();
        },
        tracings(_, args: ITracingsArguments, context: GraphQLServerContext): Promise<ISwcTracingPage> {
            return context.getTracings(args.pageInput);
        },
        tracing(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<SwcTracing> {
            return context.getTracing(args.id);
        },
        tracingNodes(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<SwcNode[]> {
            return context.getTracingNodes(args.id);
        },
        tracingNode(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<SwcNode> {
            return context.getTracingNode(args.id);
        },
        structureIdentifiers(_, __, context: GraphQLServerContext): Promise<StructureIdentifier[]> {
            return context.getStructureIdentifiers();
        },
        structureIdentifier(_, args: IIdOnlyArguments, context: GraphQLServerContext): Promise<StructureIdentifier> {
            return context.getStructureIdentifier(args.id);
        },
        tracingStructures(_, __, context: GraphQLServerContext): Promise<TracingStructure[]> {
            return context.getTracingStructures();
        },
        transformedTracingCounts(_, args: IIdsArguments, context: GraphQLServerContext): Promise<IQueryTracingsForSwcOutput> {
            return context.transformedTracingCount(args.ids);
        },
        systemMessage(): string {
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
        deleteTracingsForNeurons(_, args: NeuronIdsArguments, context: GraphQLServerContext): Promise<IDeleteSwcTracingOutput[]> {
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
        injections(sample: Sample): Promise<Injection[]> {
            return sample.getInjections();
        },
        mouseStrain(sample, _, context: GraphQLServerContext): Promise<MouseStrain> {
            if (!sample || !sample.mouseStrainId || sample.mouseStrainId.length === 0) {
                return null;
            }

            return context.getMouseStrain(sample.mouseStrainId);
        },
        activeRegistrationTransform(sample, _, context: GraphQLServerContext): Promise<RegistrationTransform> {
            if (!sample || !sample.activeRegistrationId || sample.activeRegistrationId.length === 0) {
                return null;
            }

            return context.getRegistrationTransform(sample.activeRegistrationId);
        }
    },
    Neuron: {
        brainArea(neuron, _, context: GraphQLServerContext): Promise<BrainArea> {
            return context.getBrainAreaForNeuron(neuron);
        },
        injection(neuron, _, context: GraphQLServerContext): Promise<Injection> {
            return context.getInjection(neuron.injectionId);
        }
    },
    Injection: {
        neurons(injection, _, context: GraphQLServerContext): Promise<Neuron[]> {
            return context.getNeuronsForInjection(injection);
        },
        injectionVirus(injection, _, context: GraphQLServerContext): Promise<InjectionVirus> {
            return context.getVirusForInjection(injection);
        },
        fluorophore(injection, _, context: GraphQLServerContext): Promise<Fluorophore> {
            return context.getFluorophoreForInjection(injection);
        },
        brainArea(injection, _, context: GraphQLServerContext): Promise<BrainArea> {
            return context.getBrainAreaForInjection(injection);
        }
    },
    SwcTracing: {
        nodeCount(tracing, __, context: GraphQLServerContext): Promise<number> {
            return context.getNodeCount(tracing);
        },
        tracingStructure(tracing, _, context: GraphQLServerContext): Promise<TracingStructure> {
            return context.getStructureForTracing(tracing);
        },
        neuron(tracing, _, context: GraphQLServerContext): Promise<Neuron> {
            return context.getNeuron(tracing.neuronId);
        }
    },
    SwcNode: {
        tracing(tracingNode: SwcNode): Promise<SwcTracing> {
            return tracingNode.getTracing();
        },
        structureIdentifier(tracingNode, _, context: GraphQLServerContext): Promise<StructureIdentifier> {
            return context.getStructureForNode(tracingNode);
        }
    },
    StructureIdentifier: {
        nodes(structureIdentifier, _, context: GraphQLServerContext): Promise<SwcNode[]> {
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

let systemMessage: string = "";

export default resolvers;
