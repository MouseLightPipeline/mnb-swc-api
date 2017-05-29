import {IConnectionOptions} from "ndb-data-models";

export interface IDatabases {
    sample: IDatabaseEnv;
    swc: IDatabaseEnv;
}

export interface IDatabaseEnv {
    development: IConnectionOptions;
    test: IConnectionOptions;
    azure?: IConnectionOptions;
    production: IConnectionOptions;
}

export const Databases: IDatabases = {
    sample: {
        development: {
            database: "samples_development",
            username: "postgres",
            host: "localhost",
            port: 5432,
            dialect: "postgres",
            logging: null
        },
        test: {
            database: "samples_test",
            username: "postgres",
            host: "sample-db",
            port: 5432,
            dialect: "postgres",
            logging: null
        },
        azure: {
            database: "jrcndb",
            username: "j4n3lia",
            host: "janeliandb.database.windows.net",
            dialect: "mssql",
            dialectOptions: {
                encrypt: true
            },
            logging: null
        },
        production: {
            database: "samples_production",
            username: "postgres",
            host: "sample-db",
            port: 5432,
            dialect: "postgres",
            logging: null
        }
    },
    swc: {
        development: {
            database: "swc_development",
            username: "postgres",
            host: "localhost",
            port: 5433,
            dialect: "postgres",
            logging: null
        },
        test: {
            database: "swc_test",
            username: "postgres",
            host: "swc-db",
            port: 5432,
            dialect: "postgres",
            logging: null
        },
        azure: {
            database: "jrcndb",
            username: "j4n3lia",
            host: "janeliandb.database.windows.net",
            dialect: "mssql",
            dialectOptions: {
                encrypt: true
            },
            logging: null
        },
        production: {
            database: "swc_production",
            username: "postgres",
            host: "swc-db",
            port: 5432,
            dialect: "postgres",
            logging: null
        }
    }
};
