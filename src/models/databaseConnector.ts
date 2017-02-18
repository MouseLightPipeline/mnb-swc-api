const Sequelize = require("sequelize");

const debug = require("debug")("ndb:swc-api:database-connector");

import {loadModels} from "./modelLoader";

const config = require(__dirname + "/../config/database.config");

export interface ISampleDatabaseModels {
    BrainArea?: any
    Fluorophore?: any
    InjectionVirus?: any
    MouseStrain?: any
    Sample?: any;
    Injection?: any;
    RegistrationTransform?: any;
    Neuron?: any;
}

export interface ISwcDatabaseModels {
    Tracing?: any;
    TracingNode?: any;
    StructureIdentifier?: any;
}

export interface ISequelizeDatabase<T> {
    connection: any;
    models: T;
    isConnected: boolean;
}

export class PersistentStorageManager {

    public static Instance(): PersistentStorageManager {
        return _manager;
    }

    public get Samples() {
        return this.sampleDatabase.models.Sample;
    }

    public get Injections() {
        return this.sampleDatabase.models.Injection;
    }

    public get RegistrationTransforms() {
        return this.sampleDatabase.models.RegistrationTransform;
    }

    public get Neurons() {
        return this.sampleDatabase.models.Neuron;
    }

    public get Tracings() {
        return this.swcDatabase.models.Tracing;
    }

    public get TracingNodes() {
        return this.swcDatabase.models.TracingNode;
    }

    public get StructureIdentifiers() {
        return this.swcDatabase.models.StructureIdentifier;
    }

    public async initialize() {
        await sync(this.sampleDatabase, "sample");
        await sync(this.swcDatabase, "swc");
    }

    private sampleDatabase: ISequelizeDatabase<ISampleDatabaseModels> = createConnection("sample", {});
    private swcDatabase: ISequelizeDatabase<ISwcDatabaseModels> = createConnection("swc", {});
}

async function sync(database, name, force = false) {
    try {
        await database.connection.sync({force: force});

        database.isConnected = true;

        debug(`successful ${name} database sync`);
    } catch (err) {
        debug(`failed ${name} database sync`);
        debug(err);
        setTimeout(() => sync(database, name), 5000);
    }
}

function createConnection<T>(name: string, models: T) {
    const env = process.env.NODE_ENV || "development";

    const databaseConfig = config[name][env];

    let db: ISequelizeDatabase<T> = {
        connection: null,
        models: models,
        isConnected: false
    };

    db.connection = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);

    return loadModels(db, __dirname + "/" + name);
}

const _manager: PersistentStorageManager = new PersistentStorageManager();

_manager.initialize().then(() => {
});
