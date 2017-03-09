import {ITracingNode} from "./tracingNode";
import {ISwcParseResult} from "../../Swc";

export interface ITracing {
    id: string;
    neuronId: string;
    structureIdentifierId: string;
    filename: string;
    annotator: string;
    fileComments: string;
    offsetX: number;
    offsetY: number;
    offsetZ: number;

    getNodes(): ITracingNode[];
}

export const TableName = "Tracing";

export function sequelizeImport(sequelize, DataTypes) {
    const Tracing = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        // reference to external sample database entry
        neuronId: DataTypes.UUID,
        annotator: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        // From uploaded file data
        filename: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        // Local storage, if kept
        storedFilePath: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        // comment lines found in SWC file
        fileComments: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        // Janelia offset defined in file comments
        offsetX: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        offsetY: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        offsetZ: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        }
    }, {
        classMethods: {
            associate: models => {
                Tracing.hasMany(models.TracingNode, {foreignKey: "tracingId", as: "nodes"});
                Tracing.belongsTo(models.StructureIdentifier, {foreignKey: "structureIdentifierId"});
            }
        },
        timestamps: true,
        paranoid: true
    });

    return Tracing;
}
