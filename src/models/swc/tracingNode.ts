import {IStructureIdentifierAttributes} from "./structureIdentifier";
import {DataTypes, Instance, Model} from "sequelize";
import {ISwcTracing} from "./tracing";

export interface ISwcNodeAttributes {
    id: string;
    swcTracingId: string;
    sampleNumber: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    parentNumber: number;
    structureIdentifierId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISwcTracingNode extends Instance<ISwcNodeAttributes>, ISwcNodeAttributes {
    getStructureIdentifier(): IStructureIdentifierAttributes;
    getTracing(): ISwcTracing;
}

export interface ISwcTracingNodeTable extends Model<ISwcTracingNode, ISwcNodeAttributes> {
}

export const TableName = "SwcTracingNode";

export function sequelizeImport(sequelize, dataTypes: DataTypes) {
    const TracingNode = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4
        },
        sampleNumber: dataTypes.INTEGER,
        x: dataTypes.DOUBLE,
        y: dataTypes.DOUBLE,
        z: dataTypes.DOUBLE,
        radius: dataTypes.DOUBLE,
        parentNumber: dataTypes.INTEGER
    }, {
        timestamps: true,
        paranoid: false
    });

    TracingNode.associate = models => {
        TracingNode.belongsTo(models.StructureIdentifier, {foreignKey: "structureIdentifierId"});
        TracingNode.belongsTo(models.SwcTracing, {foreignKey: "swcTracingId"});
    };

    return TracingNode;
}
