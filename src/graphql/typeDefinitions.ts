let typeDefinitions = `
scalar UploadedFile

type Sample {
    id: String
    idNumber: Int
    tag: String
    comment: String
    sampleDateString: String
    mouseStrainId: String
    mouseStrain: MouseStrain
    injections: [Injection]
    registrationTransforms: [RegistrationTransform]
    activeRegistrationTransformId: String
}

type Neuron {
    id: String
    idNumber: Int
    tag: String
    keywords: String
    x: Float
    y: Float
    z: Float
    brainAreaId: String
    brainArea: BrainArea
    injectionId: String
    injection: Injection
}

type Injection {
    id: String
    sampleId: String
    sample: Sample
    brainAreaId: String
    brainArea: BrainArea
    injectionVirusId: String
    injectionVirus: InjectionVirus
    fluorophoreId: String
    fluorophore: Fluorophore
    neurons: [Neuron]
}

type InjectionVirus {
    id: String
    name: String
    injections: [Injection]
}

type Fluorophore  {
    id: String
    name: String
    injections: [Injection]
}

type MouseStrain {
    id: String
    name: String
    samples: [Sample]
}

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
    sample: Sample
}

type BrainArea {
    id: String!
    depth: Int
    structureId: Int
    parentStructureId: Int
    structureIdPath: String
    name: String
    safeName: String
    acronym: String
    injections: [Injection]
    neurons: [Neuron]
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
    samples: [Sample!]!
    sample(id: String): Sample
    mouseStrains: [MouseStrain!]!
    mouseStrain(id: String): MouseStrain
    injections: [Injection!]!
    tracings: [Tracing!]!
    tracing(id: String): Tracing!
    tracingNodes: [TracingNode!]!
    tracingNode(id: String): TracingNode!
    structureIdentifiers: [StructureIdentifier!]!
    structureIdentifier(id: String): StructureIdentifier!
}

type Mutation {
   debug(id: String!): String
   uploadSwc(annotator: String, neuronId: String, structureId: String, files: [UploadedFile]): Boolean
}

schema {
  query: Query
  mutation: Mutation
}`;

export default typeDefinitions;
