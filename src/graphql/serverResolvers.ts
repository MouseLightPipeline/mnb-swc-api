const debug = require("debug")("ndb:swc-api:resolvers");

import {IGraphQLServerContext, INodeConnections} from "./serverContext";
import {ITracing} from "../models/swc/tracing";
import {ITracingNode} from "../models/swc/tracingNode";
import {IStructureIdentifier} from "../models/swc/structureIdentifier";

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

const resolvers = {
    Query: {
        tracings(_, __, context: IGraphQLServerContext): Promise<ITracing[]> {
            return context.getTracings();
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
