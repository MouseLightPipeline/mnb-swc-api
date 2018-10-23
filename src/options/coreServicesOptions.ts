export interface IGraphQLServiceOptions {
    host: string;
    port: number;
    graphQLEndpoint: string;
}

const databaseServices = {
    sample: {
        database: "samples_production",
        username: "postgres",
        password: "pgsecret",
        host: "sample-db",
        port: 5432,
        dialect: "postgres",
        operatorsAliases: false,
        logging: null
    },
    swc: {
        database: "swc_production",
        username: "postgres",
        password: "pgsecret",
        host: "swc-db",
        port: 5432,
        dialect: "postgres",
        operatorsAliases: false,
        logging: null
    }
};

const graphQLServices = {
    transform: {
        host: "transform-api",
        port: 5000,
        graphQLEndpoint: "graphql"
    }
};

const services = {
    database: databaseServices,
    graphQL: graphQLServices
};

function loadDatabaseOptions(options): any {
    options.sample.host = process.env.SAMPLE_DB_HOST || process.env.DATABASE_HOST || process.env.CORE_SERVICES_HOST || options.sample.host;
    options.sample.port = parseInt(process.env.SAMPLE_DB_PORT) || parseInt(process.env.DATABASE_PORT) || options.sample.port;
    options.sample.password = process.env.DATABASE_PW || options.sample.password;

    options.swc.host = process.env.SWC_DB_HOST || process.env.DATABASE_HOST || process.env.CORE_SERVICES_HOST || options.swc.host;
    options.swc.port = parseInt(process.env.SWC_DB_PORT) || parseInt(process.env.DATABASE_PORT) || options.swc.port;
    options.swc.password = process.env.DATABASE_PW || options.swc.password;

    return options;
}

function loadGraphQLOptions(options): any {
    options.transform.host = process.env.TRANSFORM_API_HOST || process.env.CORE_SERVICES_HOST || options.transform.host;
    options.transform.port = parseInt(process.env.TRANSFORM_API_PORT) || options.transform.port;
    options.transform.graphQLEndpoint = process.env.TRANSFORM_API_ENDPOINT || process.env.CORE_SERVICES_ENDPOINT || options.transform.graphQLEndpoint;

    return options;
}

function loadConfiguration() {
    const c = Object.assign({}, services);

    c.database = loadDatabaseOptions(c.database);
    c.graphQL = loadGraphQLOptions(c.graphQL);

    return c;
}

export const CoreServiceOptions = loadConfiguration();

export const SequelizeOptions = CoreServiceOptions.database;

export const TransformServiceOptions: IGraphQLServiceOptions = CoreServiceOptions.graphQL.transform;
