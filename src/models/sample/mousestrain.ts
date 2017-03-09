export const TableName = "MouseStrain";

export interface IMouseStrain {
    id: string;
    name: string;

    getSamples();
}

export function sequelizeImport(sequelize, DataTypes) {
    const MouseStrain = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name: DataTypes.TEXT
    }, {
        classMethods: {
            associate: models => {
                MouseStrain.hasMany(models.Sample, {foreignKey: "mouseStrainId", as: "samples"});
            }
        },
        timestamps: true,
        paranoid: true
    });

    function populateDefault(model) {
        return new Promise((resolve, reject) => {
            model.count().then((count) => {
                if (count < 1) {
                    if (count < 1) {
                        model.create({name: "C57BL/6J"});
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    MouseStrain.populateDefault = () => {
        return populateDefault(MouseStrain);
    };

    return MouseStrain;
}
