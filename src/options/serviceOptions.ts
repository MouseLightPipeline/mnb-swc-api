import {IConnectionOptions} from "ndb-data-models";

import {Databases} from "./databaseOptions";

export interface ITransformServiceOptions {
    host: string;
    port: number;
}

export interface IServerOptions {
    port: number;
    graphQlEndpoint: string;
    graphiQlEndpoint: string;
}

export interface IDataBaseOptions {
    sample: IConnectionOptions;
    swc: IConnectionOptions;
}

export interface IServiceOptions {
    envName: string;
    serverOptions: IServerOptions;
    databaseOptions: IDataBaseOptions;
    transformService: ITransformServiceOptions;
}

interface IConfiguration<T> {
    development: T;
    test: T;
    production: T;
}

const configurations: IConfiguration<IServiceOptions> = {
    development: {
        envName: "",
        serverOptions: {
            port: 9651,
            graphQlEndpoint: "/graphql",
            graphiQlEndpoint: "/graphiql"
        },
        databaseOptions: {
            sample: null,
            swc: null
        },
        transformService: {
            host: "localhost",
            port: 9661
        }
    },
    test: {
        envName: "",
        serverOptions: {
            port: 9651,
            graphQlEndpoint: "/graphql",
            graphiQlEndpoint: "/graphiql"
        },
        databaseOptions: {
            sample: null,
            swc: null
        },
        transformService: {
            host: "transform-api",
            port: 9661
        }
    },
    production: {
        envName: "",
        serverOptions: {
            port: 9651,
            graphQlEndpoint: "/graphql",
            graphiQlEndpoint: "/graphiql"
        },
        databaseOptions: {
            sample: null,
            swc: null
        },
        transformService: {
            host: "transform-api",
            port: 9661
        }
    }
};

function loadConfiguration(): IServiceOptions {
    const envName = process.env.NODE_ENV || "development";

    const c = configurations[envName];

    c.envName = envName;

    c.ontologyPath = process.env.ONTOLOGY_PATH || c.ontologyPath;

    const dbEnvName = process.env.DATABASE_ENV || envName;

    c.databaseOptions.sample = Databases.sample[dbEnvName];
    c.databaseOptions.sample.host = process.env.SAMPLE_DB_HOST || c.databaseOptions.sample.host;
    c.databaseOptions.sample.port = process.env.SAMPLE_DB_PORT || c.databaseOptions.sample.port;
    c.databaseOptions.sample.password = process.env.DATABASE_PW || "pgsecret";

    c.databaseOptions.swc = Databases.swc[dbEnvName];
    c.databaseOptions.swc.host = process.env.SWC_DB_HOST || c.databaseOptions.swc.host;
    c.databaseOptions.swc.port = process.env.SWC_DB_PORT || c.databaseOptions.swc.port;
    c.databaseOptions.swc.password = process.env.DATABASE_PW || "pgsecret";

    c.databaseOptions.metrics = Databases.sample[dbEnvName];

    c.transformService.host = process.env.TRANSFORM_API_HOST || c.transformService.host;
    c.transformService.port = process.env.TRANSFORM_API_PORT || c.transformService.port;

    return c;
}

export const ServiceOptions: IServiceOptions = loadConfiguration();

export const DatabaseOptions: IDataBaseOptions = ServiceOptions.databaseOptions;

export const TransformServiceOptions: ITransformServiceOptions = ServiceOptions.transformService;
