import {ITracing} from "./tracing";
import {IStructureIdentifier} from "./structureIdentifier";

export interface ITracingNode {
    id: string;
    tracingId: string;
    structureIdentifierId: string;
    sampleNumber: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    parentNumber: number;

    getTracing(): ITracing;
    getStructureIdentifier(): IStructureIdentifier;
}

export const TableName = "TracingNode";

export function sequelizeImport(sequelize, DataTypes) {
    const TracingNode = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        sampleNumber: DataTypes.INTEGER,
        x: DataTypes.DOUBLE,
        y: DataTypes.DOUBLE,
        z: DataTypes.DOUBLE,
        radius: DataTypes.DOUBLE,
        parentNumber: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: models => {
                TracingNode.belongsTo(models.StructureIdentifier, {foreignKey: "structureIdentifierId"});
                TracingNode.belongsTo(models.Tracing, {foreignKey: "tracingId"});
            }
        },
        timestamps: true,
        paranoid: true
    });

    return TracingNode;
}
