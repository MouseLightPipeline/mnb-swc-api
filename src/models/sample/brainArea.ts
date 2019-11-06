import {Sequelize, DataTypes, HasManyGetAssociationsMixin, FindOptions} from "sequelize";

import {BaseModel, EntityMutateOutput, EntityQueryInput} from "../baseModel";
import {Injection} from "./injection";
import {Neuron} from "./neuron";
import {
    optionsIncludeInjectionIds,
    optionsIncludeNeuronIds,
    optionsWhereIds,
    WithInjectionsQueryInput,
    WithNeuronsQueryInput
} from "../findOptions";

export type CompartmentQueryInput = EntityQueryInput & WithInjectionsQueryInput & WithNeuronsQueryInput;

export type CompartmentMutationData = {
    id: string;
    aliasList: string[];
}

export class BrainArea extends BaseModel {
    public structureId: number;
    public depth: number;
    public name: string;
    public parentStructureId: number;
    public structureIdPath: string;
    public safeName: string;
    public acronym: string;
    public atlasId: number;
    public aliases: string[];
    public graphId: number;
    public graphOrder: number;
    public hemisphereId: number;
    public geometryFile: string;
    public geometryColor: string;
    public geometryEnable: boolean;

    public aliasList: string[];

    public getInjections!: HasManyGetAssociationsMixin<Injection>;
    public getNeurons!: HasManyGetAssociationsMixin<Neuron>;

    public static async getAll(input: CompartmentQueryInput): Promise<BrainArea[]> {
        let options: FindOptions = optionsWhereIds(input);

        options = optionsIncludeInjectionIds(input, options);
        options = optionsIncludeNeuronIds(input, options);

        await this.setSortAndLimiting(options, input);

        return BrainArea.findAll(options);
    }

    public static async updateWith(input: CompartmentMutationData): Promise<EntityMutateOutput<BrainArea>> {
        try {
            if (!input) {
                return {source: null, error: "Brain area properties are a required input"};
            }

            if (!input.id) {
                return {source: null, error: "Brain area input must contain the id of the object to update"};
            }

            let row = await BrainArea.findByPk(input.id);

            if (!row) {
                return {source: null, error: "The brain area could not be found"};
            }

            const update = await row.update(input);

            return {source: update, error: null};
        } catch (error) {
            return {source: null, error: error.message};
        }
    }

    protected static defaultSortField(): string {
        return "depth";
    }
}

export const modelInit = (sequelize: Sequelize) => {
    BrainArea.init({
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        structureId: DataTypes.INTEGER,
        depth: DataTypes.INTEGER,
        name: DataTypes.TEXT,
        parentStructureId: DataTypes.INTEGER,
        structureIdPath: DataTypes.TEXT,
        safeName: DataTypes.TEXT,
        acronym: DataTypes.TEXT,
        aliases: DataTypes.TEXT,
        atlasId: DataTypes.INTEGER,
        graphId: DataTypes.INTEGER,
        graphOrder: DataTypes.INTEGER,
        hemisphereId: DataTypes.INTEGER,
        geometryFile: DataTypes.TEXT,
        geometryColor: DataTypes.TEXT,
        geometryEnable: DataTypes.BOOLEAN,
        aliasList: {
            type: DataTypes.VIRTUAL(DataTypes.ARRAY(DataTypes.STRING), ["aliases"]),
            get: function (): string[] {
                return JSON.parse(this.getDataValue("aliases")) || [];
            },
            set: function (value: string[]) {
                if (value && value.length === 0) {
                    value = null;
                }

                this.setDataValue("aliases", JSON.stringify(value));
            }
        }
    }, {
        timestamps: true,
        paranoid: true,
        sequelize
    });
};

export const modelAssociate = () => {
    BrainArea.hasMany(Injection, {foreignKey: "brainAreaId"});
    BrainArea.hasMany(Neuron, {foreignKey: "brainAreaId"});
};
