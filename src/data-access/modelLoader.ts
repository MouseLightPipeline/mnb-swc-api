const fs = require("fs");
const path = require("path");

import {ISequelizeDatabase} from "./storageManager";

export async function loadModels<T>(db: ISequelizeDatabase<T>, modelLocation: string) {
    fs.readdirSync(modelLocation).filter(file => {
        return (file.indexOf(".") !== 0) && (file.slice(-3) === ".js");
    }).forEach(file => {
        let modelModule = require(path.join(modelLocation, file));

        if (modelModule.sequelizeImport !== undefined && modelModule.TableName !== undefined) {
            db.models[modelModule.TableName] = db.connection.import(path.join(modelLocation, file), modelModule.sequelizeImport);
        }
    });

    Object.keys(db.models).map(modelName => {
        if (db.models[modelName].associate !== undefined) {
            db.models[modelName].associate(db.models);
        }
    });

    return db;
}
