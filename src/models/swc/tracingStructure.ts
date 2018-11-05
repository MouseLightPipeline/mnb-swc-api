import {Instance, Model} from "sequelize";
import {ISwcTracing} from "./tracing";

export const TableName = "TracingStructure";

export interface ITracingStructureAttributes {
    id: string;
    name: string;
    value: number;
}

export interface ITracingStructure extends Instance<ITracingStructureAttributes>, ITracingStructureAttributes {
    getSwcTracings(): ISwcTracing[];
}

export interface ITracingStructureTable extends Model<ITracingStructure, ITracingStructureAttributes> {
}

export function sequelizeImport(sequelize, DataTypes) {
    const TracingStructure = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name: DataTypes.TEXT,
        value: DataTypes.INTEGER
    }, {
        timestamps: true,
        paranoid: true
    });

    TracingStructure.associate = models => {
        TracingStructure.hasMany(models.SwcTracing, {foreignKey: "tracingStructureId", as: "SwcTracings"});
    };

    return TracingStructure;
}
