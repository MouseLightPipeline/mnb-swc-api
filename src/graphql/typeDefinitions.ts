import {gql} from "apollo-server-express";

export const typeDefinitions = gql`
scalar Date

type Sample {
    id: String
    idNumber: Int
    animalId: String
    tag: String
    comment: String
    sampleDate: Date
    mouseStrain: MouseStrain
    injections: [Injection!]!
    activeRegistrationTransform: RegistrationTransform
    createdAt: Date
    updatedAt: Date
}

type Neuron {
    id: String
    idNumber: Int
    idString: String
    tag: String
    keywords: String
    x: Float
    y: Float
    z: Float
    brainArea: BrainArea
    injection: Injection
    createdAt: Date
    updatedAt: Date
}

type Injection {
    id: String
    sample: Sample
    brainArea: BrainArea
    injectionVirus: InjectionVirus
    fluorophore: Fluorophore
    neurons: [Neuron]
    createdAt: Date
    updatedAt: Date
}

type InjectionVirus {
    id: String
    name: String
    injections: [Injection]
    createdAt: Date
    updatedAt: Date
}

type Fluorophore  {
    id: String
    name: String
    injections: [Injection]
    createdAt: Date
    updatedAt: Date
}

type MouseStrain {
    id: String
    name: String
    samples: [Sample]
    createdAt: Date
    updatedAt: Date
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
    aliases: [String]
    injections: [Injection]
    neurons: [Neuron]
    createdAt: Date
    updatedAt: Date
}

type StructureIdentifier {
    id: String!
    name: String
    value: Int
    mutable: Boolean
    nodes: [SwcNode]
    createdAt: Date
    updatedAt: Date
}

type TracingStructure {
    id: String!
    name: String
    value: Int
    createdAt: Date
    updatedAt: Date
}

type SwcTracing {
    id: String!
    filename: String
    annotator: String
    fileComments: String
    offsetX: Float
    offsetY: Float
    offsetZ: Float
    nodeCount: Int
    tracingStructure: TracingStructure
    neuron: Neuron
    createdAt: Date
    updatedAt: Date
}

type SwcNode {
    id: String!
    sampleNumber: Int
    parentNumber: Int
    x: Float
    y: Float
    z: Float
    radius: Float
    structureIdentifier: StructureIdentifier
    structureIdValue: Int
    tracing: SwcTracing
    createdAt: Date
    updatedAt: Date
}

type SwcTracingPage {
    offset: Int
    limit: Int
    totalCount: Int
    matchCount: Int
    tracings: [SwcTracing!]!
}

type Error {
    message: String
    name: String
}

type UploadOutput {
    tracing: SwcTracing
    transformSubmission: Boolean
    error: Error
}

type TracingsForSwcOutput {
    count: Int
    error: Error
}

type UpdateSwcTracingOutput {
    tracing: SwcTracing
    error: Error
}

type DeleteSwcTracingOutput {
    id: String
    error: Error
}

input SwcTracingInput {
    id: String!
    annotator: String
    neuronId: String
    tracingStructureId: String
}

input SwcTracingPageInput {
    offset: Int
    limit: Int
    neuronIds: [String!]
    tracingStructureId: String
}

type Query {
    samples: [Sample!]!
    sample(id: String): Sample
    
    mouseStrains: [MouseStrain!]!    
    mouseStrain(id: String): MouseStrain
    
    injections: [Injection!]!
    
    neurons(sampleId: String): [Neuron!]!
    
    tracings(pageInput: SwcTracingPageInput): SwcTracingPage!
    tracing(id: String): SwcTracing!
    tracingNodes(id: String): [SwcNode!]!
    tracingNode(id: String): SwcNode!
    
    structureIdentifiers: [StructureIdentifier!]!
    structureIdentifier(id: String): StructureIdentifier!
    
    tracingStructures: [TracingStructure!]!

    transformedTracingCount(id: String): TracingsForSwcOutput

    systemMessage: String
}

type Mutation {
    uploadSwc(annotator: String, neuronId: String, structureId: String, file: Upload): UploadOutput!
   
    updateTracing(tracing: SwcTracingInput): UpdateSwcTracingOutput!
   
    deleteTracing(id: String!): DeleteSwcTracingOutput
    deleteTracings(ids: [String!]): [DeleteSwcTracingOutput]
    deleteTracingsForNeurons(neuronIds: [String!]): [DeleteSwcTracingOutput]
   
    setSystemMessage(message: String): Boolean
    clearSystemMessage: Boolean
}

schema {
    query: Query
    mutation: Mutation
}`;
