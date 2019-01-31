import * as path from "path";
import {Sequelize, QueryInterface} from "sequelize";
import * as SequelizeFactory from "sequelize";

const debug = require("debug")("mnb:swc-api:database-connector");

import {loadModels} from "./modelLoader";
import {SequelizeOptions} from "../options/coreServicesOptions";
import {IBrainAreaTable} from "../models/sample/brainArea";
import {IFluorophoreTable} from "../models/sample/fluorophore";
import {IInjectionTable} from "../models/sample/injection";
import {IInjectionVirusTable} from "../models/sample/injectionVirus";
import {IMouseStrainTable} from "../models/sample/mouseStrain";
import {INeuronTable} from "../models/sample/neuron";
import {ITransformTable} from "../models/sample/transform";
import {ISampleTable} from "../models/sample/sample";
import {ISwcTracingNodeTable} from "../models/swc/tracingNode";
import {ISwcTracingTable} from "../models/swc/tracing";
import {ITracingStructureTable} from "../models/swc/tracingStructure";
import {IStructureIdentifierTable} from "../models/swc/structureIdentifier";

export interface ILocalDatabase<T> {
    connection: Sequelize;
    models: T;
    isConnected: boolean;
}

export class SampleTables {
    public constructor() {
        this.BrainArea = null;
        this.Fluorophore = null;
        this.Injection = null;
        this.InjectionVirus = null;
        this.MouseStrain = null;
        this.Neuron = null;
        this.Sample = null;
        this.RegistrationTransform = null;
    }

    BrainArea: IBrainAreaTable;
    Fluorophore: IFluorophoreTable;
    Injection: IInjectionTable;
    InjectionVirus: IInjectionVirusTable;
    MouseStrain: IMouseStrainTable;
    Neuron: INeuronTable;
    RegistrationTransform: ITransformTable;
    Sample: ISampleTable;
}

export interface ISampleDatabase extends ILocalDatabase<SampleTables> {
}

export class SwcTables {
    public constructor() {
        this.SwcTracing = null;
        this.SwcTracingNode = null;
        this.StructureIdentifier = null;
        this.TracingStructure = null;
    }

    SwcTracing: ISwcTracingTable;
    SwcTracingNode: ISwcTracingNodeTable;
    StructureIdentifier: IStructureIdentifierTable;
    TracingStructure: ITracingStructureTable;
}

export interface ISwcDatabase extends ILocalDatabase<SwcTables> {
}

export class PersistentStorageManager {

    private sampleDatabase: ISampleDatabase;
    private swcDatabase: ISwcDatabase;

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
        this.sampleDatabase = await createConnection<SampleTables>("sample", new SampleTables());
        await authenticate(this.sampleDatabase, "sample");

        this.swcDatabase = await createConnection<SwcTables>("swc", new SwcTables());
        await authenticate(this.swcDatabase, "swc");

        await this.seedIfRequired();
    }

    private async seedIfRequired() {
        const count = await this.StructureIdentifiers.count();

        if (count > 0) {
            debug("skipping seed - structure identifiers exist");
            return;
        }

        debug("seeding database");

        const queryInterface: QueryInterface = this.swcDatabase.connection.getQueryInterface();

        const when = new Date();

        await queryInterface.bulkInsert("StructureIdentifiers", loadStructureIdentifiers(when), {});
        await queryInterface.bulkInsert("TracingStructures", loadTracingStructures(when), {});

        // Need to fill cache if first seed - was empty when authenticate is called.
        Object.keys(this.swcDatabase.models).map(modelName => {
            if (this.swcDatabase.models[modelName].prepareContents) {
                this.swcDatabase.models[modelName].prepareContents();
            }
        });
    }
}

async function authenticate(database, name) {
    try {
        await database.connection.authenticate();

        database.isConnected = true;

        debug(`successful database connection: ${name}`);

        if (name === "swc") {
            Object.keys(database.models).map(modelName => {
                if (database.models[modelName].prepareContents) {
                    database.models[modelName].prepareContents();
                }
            });
        }
    } catch (err) {
        debug(`failed database connection: ${name}`);
        debug(err);
        setTimeout(() => authenticate(database, name), 5000);
    }
}

async function createConnection<T>(name: string, models: T) {
    let databaseConfig = SequelizeOptions[name];

    let db: ILocalDatabase<T> = {
        connection: null,
        models: models,
        isConnected: false
    };

    db.connection = new SequelizeFactory(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);

    return await loadModels<T>(db, path.join(__dirname,  "..", "models",  name));
}

function loadTracingStructures(when: Date) {
    return [
        {
            id: "68e76074-1777-42b6-bbf9-93a6a5f02fa4",
            name: "axon",
            value: 1,
            updatedAt: when,
            createdAt: when
        },
        {
            id: "aef2ba31-8f9b-4a47-9de0-58dab1cc06a8",
            name: "dendrite",
            value: 2,
            updatedAt: when,
            createdAt: when
        }
    ];
}

function loadStructureIdentifiers(when: Date) {
    return [
        {
            id: "9b2cf056-1fba-468f-a877-04169dd9f708",
            name: "path",
            swcName: "undefined",
            value: 0,
            mutable: false,
            updatedAt: when,
            createdAt: when
        },
        {
            id: "6afcafa5-ec7f-4899-8941-3e1f812682ce",
            name: "soma",
            swcName: "soma",
            value: 1,
            mutable: false,
            updatedAt: when,
            createdAt: when
        },
        {
            id: "a1df739e-f4a8-4b88-9a25-2cd6b9a7563c",
            name: "axon",
            swcName: "axon",
            value: 2,
            mutable: false,
            updatedAt: when,
            createdAt: when
        },
        {
            id: "d8eb210f-65fe-4983-bdcb-e34de5ca2e13",
            name: "(basal) dendrite",
            swcName: "(basal) dendrite",
            value: 3,
            mutable: false,
            updatedAt: when,
            createdAt: when
        },
        {
            id: "a3dec6a1-7484-45a7-bc05-cf3d6014c44d",
            name: "apical dendrite",
            swcName: "apical dendrite",
            value: 4,
            mutable: false,
            updatedAt: when,
            createdAt: when
        },
        {
            id: "2a8efa78-1067-4ce8-8e4f-cfcf9cf7d315",
            name: "branch point",
            swcName: "fork point",
            value: 5,
            mutable: false,
            updatedAt: when,
            createdAt: when
        },
        {
            id: "c37953e1-a1e9-4b9a-847e-08d9566ced65",
            name: "end point",
            swcName: "end point",
            value: 6,
            mutable: false,
            updatedAt: when,
            createdAt: when
        }
    ];
}

const _manager: PersistentStorageManager = new PersistentStorageManager();

_manager.initialize().then(() => {
});

