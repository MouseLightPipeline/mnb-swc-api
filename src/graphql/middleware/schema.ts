import {makeExecutableSchema, addMockFunctionsToSchema} from "graphql-tools";

import typeDefinitions from "../typeDefinitions";
import resolvers from "../serverResolvers";
import {GraphQLScalarType} from "graphql";
import { Kind } from "graphql/language";

export interface IUploadFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

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

const uploadedFileScalarType = new GraphQLScalarType({
    name: "UploadedFile",
    description: "Uploaded file",
    serialize: value => value,
    parseValue: value => value,
    parseLiteral: parseJSONLiteral
});


resolvers["UploadedFile"] = uploadedFileScalarType;

let executableSchema = makeExecutableSchema({
    typeDefs: typeDefinitions,
    resolvers: resolvers,
    resolverValidationOptions: {
        requireResolversForNonScalar: false
    }
});

addMockFunctionsToSchema({
    schema: executableSchema,
    mocks: {
        String: () => "Not implemented",
        DateTime: () => Date.now()
    },
    preserveResolvers: true
});

export {executableSchema as schema};
