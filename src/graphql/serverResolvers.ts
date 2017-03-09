const debug = require("debug")("ndb:swc-api:resolvers");

import {IGraphQLServerContext, INodeConnections} from "./serverContext";

import {ISample} from "../models/sample/sample";
import {INeuron} from "../models/sample/neuron";
import {IInjection} from "../models/sample/injection";
import {ITracing} from "../models/swc/tracing";
import {ITracingNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";
import {IFluorophore} from "../models/sample/fluorophore";
import {IInjectionVirus} from "../models/sample/InjectionVirus";
import {IBrainArea} from "../models/sample/brainArea";
import {IMouseStrain} from "../models/sample/mousestrain";

interface IIdOnlyArguments {
    id: string;
}

interface ISimplePaginationArguments {
    first: number;
    count: number;
}

interface IConnectionArguments {
    first: number;
    after: string;
}

interface ITracingUploadArguments {
    annotator: string;
    neuronId: string;
    structureId: string;
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
        tracings(_, __, context: IGraphQLServerContext): Promise<ITracing[]> {
            return context.getTracings();
        },
        injections(_, __, context: IGraphQLServerContext): Promise<IInjection[]> {
            return context.getInjections();
        },
        tracing(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<ITracing> {
            return context.getTracing(args.id);
        },
        tracingNodes(_, __, context: IGraphQLServerContext): Promise<ITracingNode[]> {
            return context.getTracingNodes();
        },
        tracingNode(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<ITracingNode> {
            return context.getTracingNode(args.id);
        },
        structureIdentifiers(_, __, context: IGraphQLServerContext): Promise<IStructureIdentifier[]> {
            return context.getStructureIdentifiers();
        },
        structureIdentifier(_, args: IIdOnlyArguments, context: IGraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureIdentifier(args.id);
        }
    },
    Mutation: {
        debug(_, args: IIdOnlyArguments, context: IGraphQLServerContext): string {
            return "message";
        },
        uploadSwc(_, args: ITracingUploadArguments, context: IGraphQLServerContext): Promise<boolean> {
            return context.receiveSwcUpload(args.annotator, args.neuronId, args.structureId);
        }
    },
    Sample: {
        injections(sample, _, context: IGraphQLServerContext): Promise<IInjection[]> {
            return context.getInjectionsForSample(sample);
        },
        mouseStrain(sample, _, context: IGraphQLServerContext): Promise<IMouseStrain> {
            if (!sample) {
                return null;
            }
            return context.getMouseStrain(sample.mouseStrainId);
        }
    },
    Neuron: {
        brainArea(neuron, _, context: IGraphQLServerContext): Promise<IBrainArea> {
            return context.getBrainAreaForNeuron(neuron);
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
    Tracing: {
        nodes(tracing, args: ISimplePaginationArguments, context: IGraphQLServerContext): Promise<ITracingNode[]> {
            return context.getNodesForTracing(tracing, args.first, args.count);
        },
        nodesConnection(tracing, args: IConnectionArguments, context: IGraphQLServerContext): Promise<INodeConnections> {
            return context.getNodesConnectionForTracing(tracing, args.first, args.after);
        },
        structureIdentifier(tracing, _, context: IGraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureForTracing(tracing);
        }
    },
    TracingNode: {
        tracing(tracingNode, _, context: IGraphQLServerContext): Promise<ITracing> {
            return context.getTracingForNode(tracingNode);
        },
        structureIdentifier(tracingNode, _, context: IGraphQLServerContext): Promise<IStructureIdentifier> {
            return context.getStructureForNode(tracingNode);
        }
    },
    StructureIdentifier: {
        nodes(structureIdentifier, _, context: IGraphQLServerContext): Promise<ITracingNode[]> {
            return context.getNodesForStructure(structureIdentifier);
        }
    }
};

export default resolvers;
