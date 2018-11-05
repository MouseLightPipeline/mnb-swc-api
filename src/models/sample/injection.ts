import {DataTypes, Instance, Model, Models} from "sequelize";

import {INeuron} from "./neuron";
import {IFluorophore} from "./fluorophore";
import {IInjectionVirus} from "./injectionVirus";
import {IBrainArea} from "./brainArea";
import {ISample} from "./sample";

export interface IInjectionAttributes {
    id?: string;
    brainAreaId?: string;
    injectionVirusId?: string;
    fluorophoreId?: string;
    sampleId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IInjection extends Instance<IInjectionAttributes>, IInjectionAttributes {
    getSamples(): ISample[];
    getBrainArea?(): IBrainArea;
    getInjectionVirus?(): IInjectionVirus;
    getFluorophore?(): IFluorophore;
    getNeurons?(): INeuron[];
}

export interface IInjectionTable extends Model<IInjection, IInjectionAttributes> {
}

export const TableName = "Injection";

// noinspection JSUnusedGlobalSymbols
export function sequelizeImport(sequelize, DataTypes: DataTypes): IInjectionTable {
    const Injection: IInjectionTable = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
    }, {
        timestamps: true,
        paranoid: true
    });

    Injection.associate = (models: Models) => {
        Injection.belongsTo(models.Sample, {foreignKey: "sampleId", as: "sample"});
        Injection.belongsTo(models.BrainArea, {foreignKey: "brainAreaId", as: "brainArea"});
        Injection.belongsTo(models.InjectionVirus, {foreignKey: "injectionVirusId", as: "injectionVirus"});
        Injection.belongsTo(models.Fluorophore, {foreignKey: "fluorophoreId", as: "fluorophore"});
        Injection.hasMany(models.Neuron, {foreignKey: "injectionId", as: "neurons"});
    };

    return Injection;
}
