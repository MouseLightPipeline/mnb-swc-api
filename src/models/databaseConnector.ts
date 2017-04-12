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
    SwcTracing?: any;
    SwcTracingNode?: any;
    StructureIdentifier?: any;
    TracingStructure?: any;
}

export interface ISequelizeDatabase<T> {
    connection: any;
    models: T;
    isConnected: boolean;
}

export class PersistentStorageManager {

    private sampleDatabase: ISequelizeDatabase<ISampleDatabaseModels>;
    private swcDatabase: ISequelizeDatabase<ISwcDatabaseModels>;

    public static Instance(): PersistentStorageManager {
        return _manager;
    }

    public get SwcConnection() {
        return this.swcDatabase.connection;
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

    public get MouseStrains() {
        return this.sampleDatabase.models.MouseStrain;
    }

    public get InjectionViruses() {
        return this.sampleDatabase.models.InjectionVirus;
    }

    public get Fluorophores() {
        return this.sampleDatabase.models.Fluorophore;
    }

    public get BrainAreas() {
        return this.sampleDatabase.models.BrainArea;
    }

    public get SwcTracings() {
        return this.swcDatabase.models.SwcTracing;
    }

    public get SwcNodes() {
        return this.swcDatabase.models.SwcTracingNode;
    }

    public get TracingStructures() {
        return this.swcDatabase.models.TracingStructure;
    }

    public get StructureIdentifiers() {
        return this.swcDatabase.models.StructureIdentifier;
    }

    public async initialize() {
        this.sampleDatabase = await createConnection("sample", {});
        await authenticate(this.sampleDatabase, "sample");

        this.swcDatabase = await createConnection("swc", {});
        await authenticate(this.swcDatabase, "swc");
    }
}

async function authenticate(database, name) {
    try {
        await database.connection.authenticate();

        database.isConnected = true;

        debug(`successful database connection: ${name}`);
    } catch (err) {
        debug(`failed database connection: ${name}`);
        debug(err);
        setTimeout(() => authenticate(database, name), 5000);
    }
}

async function createConnection<T>(name: string, models: T) {
    const env = process.env.NODE_ENV || "development";

    const databaseConfig = config[name][env];

    let db: ISequelizeDatabase<T> = {
        connection: null,
        models: models,
        isConnected: false
    };

    db.connection = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);

    return await loadModels(db, __dirname + "/" + name);
}

const _manager: PersistentStorageManager = new PersistentStorageManager();

_manager.initialize().then(() => {
});
