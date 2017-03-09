export const TableName = "Sample";

export interface ISample {
    id: string,
    idNumber: number;
    tag: string;
    comment: string;
    sampleDate: Date;
    sampleDateString: string;
    mouseStrainId: string;
    activeRegistrationId: string;

    getRegistrationTransforms()
    getMouseStrain();
}

export function sequelizeImport(sequelize, DataTypes) {
    const Sample = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        idNumber: {
            type: DataTypes.INTEGER,
            defaultValue: -1
        },
        tag: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        comment: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        sampleDate: DataTypes.DATE,
        activeRegistrationTransformId: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },

    }, {
        classMethods: {
            associate: models => {
                Sample.hasMany(models.Injection, {foreignKey: "sampleId", as: "injections"});
                Sample.hasMany(models.RegistrationTransform, {foreignKey: "sampleId", as: "registrationTransforms"});
                Sample.belongsTo(models.MouseStrain, {foreignKey: "mouseStrainId", as: "mouseStrain"});
            }
        },
        getterMethods   : {
            sampleDateString : function()  { return this.sampleDate.toUTCString(); }
        },

        setterMethods   : {
            sampleDateString  : function(value) {
                this.setDataValue("sampleDate", new Date(value));
            },
        },
        timestamps: true,
        paranoid: true
    });

    return Sample;
}
