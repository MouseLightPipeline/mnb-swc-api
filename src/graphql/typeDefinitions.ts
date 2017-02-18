let typeDefinitions = `
type PageInfo {
    endCursor: String
    hasNextPage: Boolean
}

type NodeEdge {
    node: TracingNode
    cursor: String
}

type NodesConnection {
    totalCount: Int
    pageInfo: PageInfo
    edges: [NodeEdge]
}

type RegistrationTransform {
    id: String!
    location: String
    name: String
    notes: String
}

type StructureIdentifier {
    id: String!
    name: String
    value: Int
    mutable: Boolean
    nodes: [TracingNode]
}

type TracingNode {
    id: String!
    tracingId: String
    structureIdentifierId: String
    sampleNumber: Int
    x: Float
    y: Float
    z: Float
    radius: Float
    parentNumber: Int
    structureIdentifier: StructureIdentifier
    tracing: Tracing
}

type Tracing {
    id: String!
    structureIdentifierId: String
    filename: String
    annotator: String
    fileComments: String
    offsetX: Float
    offsetY: Float
    offsetZ: Float
    structureIdentifier: StructureIdentifier
    nodes(first: Int, count: Int): [TracingNode]
    nodesConnection(first: Int, after: String): NodesConnection
}

type Query {
     tracings: [Tracing!]!
     tracing(id: String): Tracing!
     tracingNodes: [TracingNode!]!
     tracingNode(id: String): TracingNode!
     structureIdentifiers: [StructureIdentifier!]!
     structureIdentifier(id: String): StructureIdentifier!
}

type Mutation {
   debug(id: String!): String
}

schema {
  query: Query
  mutation: Mutation
}`;

export default typeDefinitions;
