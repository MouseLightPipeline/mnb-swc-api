import {IConfiguration} from "./configuration";

interface ITransformService {
    host: string;
    port: number;
}

interface IServerConfig {
    port: number;
    graphQlEndpoint: string;
    graphiQlEndpoint: string;
    transformService: ITransformService;
}

const configurations: IConfiguration<IServerConfig> = {
    development: {
        port: 9651,
        graphQlEndpoint: "/graphql",
        graphiQlEndpoint: "/graphiql",
        transformService: {
            host: 'localhost',
            port: 9661
        }
    },
    test: {
        port: 9651,
        graphQlEndpoint: "/graphql",
        graphiQlEndpoint: "/graphiql",
        transformService: {
            host: 'transform-api',
            port: 9661
        }
    },
    production: {
        port: 9651,
        graphQlEndpoint: "/graphql",
        graphiQlEndpoint: "/graphiql",
        transformService: {
            host: 'transform-api',
            port: 9661
        }
    }
};

function loadConfiguration(): IServerConfig {
    let env = process.env.NODE_ENV || "development";

    return configurations[env];
}

export const serverConfiguration: IServerConfig = loadConfiguration();
