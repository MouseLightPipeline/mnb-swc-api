const debug = require("debug")("ndb:swc-api:resolvers");

import {
    IDeleteSwcTracingOutput,
    IGraphQLServerContext, IQueryTracingsForSwcOutput,
    ISwcTracingPage,
    ISwcTracingPageInput,
    IUpdateSwcTracingOutput,
    IUploadOutput
} from "./serverContext";

import {ISwcTracing, ISwcTracingInput} from "../models/swc/tracing";
import {ISwcNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";
import {ITracingStructure} from "../models/swc/tracingStructure";
import {
    IBrainArea, IFluorophore, IInjection, IInjectionVirus, IMouseStrain, INeuron, IRegistrationTransform,
    ISample
} from "ndb-data-models";

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
}

interface ITracingUploadArguments {
    annotator: string;
    neuronId: string;
    structureId: string;
}

interface IUpdateTracingArguments {
    tracing: ISwcTracingInput;
}

const resolvers = {
    Query: {
        samples(_, __, context: IGraphQLServerContext): Promise<ISample[]> {
            return context.getSamples();
        },
        sample(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<ISample> {
            return context.getSample(args.id);
        },
        mouseStrains(_, __, context: IGraphQLServerContext): Promise<IMouseStrain[]> {
            return context.getMouseStrains();
        },
        mouseStrain(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<IMouseStrain> {
            return context.getMouseStrain(args.id);
        },
        neurons(_, args: ISampleIdArguments, context: IGraphQLServerContext): Promise<INeuron[]> {
            return context.getNeurons(args.sampleId);
        },
        injections(_, __, context: IGraphQLServerContext): Promise<IInjection[]> {
            return context.getInjections();
        },
        tracings(_, args: ITracingsArguments, context: IGraphQLServerContext): Promise<ISwcTracingPage> {
            return context.getTracings(args.pageInput);
        },
        tracing(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<ISwcTracing> {
            return context.getTracing(args.id);
        },
        tracingNodes(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<ISwcNode[]> {
            return context.getTracingNodes(args.id);
        },
        tracingNode(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<ISwcNode> {
            return context.getTracingNode(args.id);
        },
        structureIdentifiers(_, __, context: IGraphQLServerContext): Promise<IStructureIdentifier[]> {
            return context.getStructureIdentifiers();
        },
        structureIdentifier(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureIdentifier(args.id);
        },
        tracingStructures(_, __, context: IGraphQLServerContext): Promise<ITracingStructure[]> {
            return context.getTracingStructures();
        },
        systemMessage(): String {
            return systemMessage;
        }
    },
    Mutation: {
        uploadSwc(_, args: ITracingUploadArguments, context: IGraphQLServerContext): Promise<IUploadOutput> {
            return context.receiveSwcUpload(args.annotator, args.neuronId, args.structureId);
        },
        updateSwc(_, args: ITracingUpdateSwcArguments, context: IGraphQLServerContext): Promise<IUploadOutput> {
            return context.receiveSwcUpdate(args.id);
        },
        transformedTracingsForSwc(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<IQueryTracingsForSwcOutput> {
            return context.transformedTracingsForSwc(args.id);
        },

        updateTracing(_, args: IUpdateTracingArguments, context: IGraphQLServerContext): Promise<IUpdateSwcTracingOutput> {
            return context.updateTracing(args.tracing);
        },
        deleteTracing(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<IDeleteSwcTracingOutput> {
            return context.deleteTracing(args.id);
        },
        deleteTracings(_, args: IIdsArguments, context: IGraphQLServerContext): Promise<IDeleteSwcTracingOutput[]> {
            return context.deleteTracings(args.ids);
        },
        deleteTracingsForNeurons(_, args: INeuronIdsArguments, context: IGraphQLServerContext): Promise<IDeleteSwcTracingOutput[]> {
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
        injections(sample, _, context: IGraphQLServerContext): Promise<IInjection[]> {
            if (!sample || !sample.id || sample.id.length === 0) {
                return null;
            }

            return context.getInjectionsForSample(sample);
        },
        mouseStrain(sample, _, context: IGraphQLServerContext): Promise<IMouseStrain> {
            if (!sample || !sample.mouseStrainId || sample.mouseStrainId.length === 0) {
                return null;
            }

            return context.getMouseStrain(sample.mouseStrainId);
        },
        activeRegistrationTransform(sample, _, context: IGraphQLServerContext): Promise<IRegistrationTransform> {
            if (!sample || !sample.activeRegistrationId || sample.activeRegistrationId.length === 0) {
                return null;
            }

            return context.getRegistrationTransform(sample.activeRegistrationId);
        }
    },
    Neuron: {
        brainArea(neuron, _, context: IGraphQLServerContext): Promise<IBrainArea> {
            return context.getBrainAreaForNeuron(neuron);
        },
        injection(neuron, _, context: IGraphQLServerContext): Promise<IInjection> {
            return context.getInjection(neuron.injectionId);
        }
    },
    Injection: {
        neurons(injection, _, context: IGraphQLServerContext): Promise<INeuron[]> {
            return context.getNeuronsForInjection(injection);
        },
        injectionVirus(injection, _, context: IGraphQLServerContext): Promise<IInjectionVirus> {
            return context.getVirusForInjection(injection);
        },
        fluorophore(injection, _, context: IGraphQLServerContext): Promise<IFluorophore> {
            return context.getFluorophoreForInjection(injection);
        },
        brainArea(injection, _, context: IGraphQLServerContext): Promise<IBrainArea> {
            return context.getBrainAreaForInjection(injection);
        }
    },
    SwcTracing: {
        nodeCount(tracing, __, context: IGraphQLServerContext): Promise<number> {
            return context.getNodeCount(tracing);
        },
        tracingStructure(tracing, _, context: IGraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureForTracing(tracing);
        },
        neuron(tracing, _, context: IGraphQLServerContext): Promise<INeuron> {
            return context.getNeuron(tracing.neuronId);
        }
    },
    SwcNode: {
        tracing(tracingNode, _, context: IGraphQLServerContext): Promise<ISwcTracing> {
            return context.getTracingForNode(tracingNode);
        },
        structureIdentifier(tracingNode, _, context: IGraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureForNode(tracingNode);
        },
        // structureIdValue(node: ISwcNode, _, context: IGraphQLServerContext): number {
        //     return context.getStructureIdValue(node.structureIdentifierId);
        // }
    },
    StructureIdentifier: {
        nodes(structureIdentifier, _, context: IGraphQLServerContext): Promise<ISwcNode[]> {
            return context.getNodesForStructure(structureIdentifier);
        }
    }
};

let systemMessage: String = "";

export default resolvers;
