import {IRegistrationTransform} from "../models/sample/registrationTransform";
const debug = require("debug")("ndb:swc-api:resolvers");

import {
    IDeleteSwcTracingOutput,
    IGraphQLServerContext, IQueryTracingsForSwcOutput,
    ISwcTracingPage,
    ISwcTracingPageInput,
    IUpdateSwcTracingOutput,
    IUploadOutput
} from "./serverContext";

import {ISample} from "../models/sample/sample";
import {INeuron} from "../models/sample/neuron";
import {IInjection} from "../models/sample/injection";
import {ISwcTracing, ISwcTracingInput} from "../models/swc/tracing";
import {ISwcNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";
import {IFluorophore} from "../models/sample/fluorophore";
import {IInjectionVirus} from "../models/sample/InjectionVirus";
import {IBrainArea} from "../models/sample/brainArea";
import {IMouseStrain} from "../models/sample/mousestrain";
import {ITracingStructure} from "../models/swc/tracingStructure";

interface IIdOnlyArguments {
    id: string;
}

interface ITracingIdArguments {
    tracingId: string;
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
        tracingNodes(_, __, context: IGraphQLServerContext): Promise<ISwcNode[]> {
            return context.getTracingNodes();
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
        }
    },
    Mutation: {
        uploadSwc(_, args: ITracingUploadArguments, context: IGraphQLServerContext): Promise<IUploadOutput> {
            return context.receiveSwcUpload(args.annotator, args.neuronId, args.structureId);
        },
        transformedTracingsForSwc(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<IQueryTracingsForSwcOutput> {
            return context.transformedTracingsForSwc(args.id);
        },
        updateTracing(_, args: IUpdateTracingArguments, context: IGraphQLServerContext): Promise<IUpdateSwcTracingOutput> {
            return context.updateTracing(args.tracing);
        },
        deleteTracing(_, args: ITracingIdArguments, context: IGraphQLServerContext): Promise<IDeleteSwcTracingOutput> {
            return context.deleteTracing(args.tracingId);
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
        }
    },
    StructureIdentifier: {
        nodes(structureIdentifier, _, context: IGraphQLServerContext): Promise<ISwcNode[]> {
            return context.getNodesForStructure(structureIdentifier);
        }
    }
};

export default resolvers;
