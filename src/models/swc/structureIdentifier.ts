import {ITracingNode} from "./tracingNode";

export interface IStructureIdentifier {
    id: string;
    name: string;
    value: number;
    mutable: boolean;

    getNodes(): ITracingNode[];
}

export const TableName = "StructureIdentifier";

export function sequelizeImport(sequelize, DataTypes) {
    const StructureIdentifier = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name: DataTypes.TEXT,
        value: DataTypes.INTEGER,
        mutable: {type: DataTypes.BOOLEAN, defaultValue: true}
    }, {
        classMethods: {
            associate: models => {
                StructureIdentifier.hasMany(models.TracingNode, {foreignKey: "structureIdentifierId", as: "Nodes"});
            }
        },
        timestamps: true,
        paranoid: true
    });

    StructureIdentifier.populateDefault = function () {
        populateDefault(StructureIdentifier);
    };

    StructureIdentifier.getMap = async() => {
        const structures = await StructureIdentifier.findAll();

        let currentStructureMap = {};

        structures.forEach((obj) => {
            currentStructureMap[obj.value] = obj.id;
        });

        return currentStructureMap;
    };

    return StructureIdentifier;
}

function getMap(model) {
    return new Promise(function (resolve, reject) {
        let currentStructureMap = {};

        model.findAll().then(structures => {
            structures.forEach((obj) => {
                currentStructureMap[obj.value] = obj.id;
            });

            resolve(currentStructureMap);
        });
    });
}

function populateDefault(model) {
    return new Promise(function (resolve, reject) {
        model.count().then(function (count) {
            if (count < 1) {
                model.create({name: 'undefined', value: 0, mutable: false});
            }
            if (count < 2) {
                model.create({name: 'soma', value: 1, mutable: false});
            }
            if (count < 3) {
                model.create({name: 'axon', value: 2, mutable: false});
            }
            if (count < 4) {
                model.create({name: '(basal) dendrite', value: 3, mutable: false});
            }
            if (count < 5) {
                model.create({name: 'apical dendrite', value: 4, mutable: false});
            }
            if (count < 6) {
                model.create({name: 'fork point', value: 5, mutable: false});
            }
            if (count < 7) {
                model.create({name: 'end point', value: 6, mutable: false});
            }
            resolve();
        });
    });
}

/*
 async function populateDefault(model) {
 try {
 let count = await model.count();

 if (count < 1) {
 await model.create({name: "undefined", value: 0, mutable: false});
 }
 if (count < 2) {
 await model.create({name: "soma", value: 1, mutable: false});
 }
 if (count < 3) {
 await model.create({name: "axon", value: 2, mutable: false});
 }
 if (count < 4) {
 await model.create({name: "(basal) dendrite", value: 3, mutable: false});
 }
 if (count < 5) {
 await model.create({name: "apical dendrite", value: 4, mutable: false});
 }
 if (count < 6) {
 await model.create({name: "fork point", value: 5, mutable: false});
 }
 if (count < 7) {
 await model.create({name: "end point", value: 6, mutable: false});
 }
 } catch (err) {
 console.log(err);
 }
 }*/