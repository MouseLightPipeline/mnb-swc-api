import * as os from "os";
import * as express from "express";
import {ApolloServer} from "apollo-server-express";

const debug = require("debug")("mnb:swc-api:server");

import {ServiceOptions} from "./options/serviceOptions";
import {typeDefinitions} from "./graphql/typeDefinitions";
import resolvers from "./graphql/serverResolvers";
import {GraphQLServerContext} from "./graphql/serverContext";
import {swcExportMiddleware} from "./middleware/swcExportMiddleware";
import bodyParser = require("body-parser");
import {RemoteDatabaseClient} from "./data-access/storageManager";
import {SequelizeOptions} from "./options/coreServicesOptions";

start().then().catch((err) => debug(err));

async function start() {
    await RemoteDatabaseClient.Start("sample", SequelizeOptions.sample);
    await RemoteDatabaseClient.Start("swc", SequelizeOptions.swc);

    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));

    app.use(bodyParser.json());

    const server = new ApolloServer({
        typeDefs: typeDefinitions, resolvers,
        introspection: true,
        playground: true,
        context: () => new GraphQLServerContext()
    });

    server.applyMiddleware({app, path: ServiceOptions.graphQLEndpoint});

    app.use("/swc", swcExportMiddleware);

    app.listen(ServiceOptions.port, () => debug(`swc api server is now running on http://${os.hostname()}:${ServiceOptions.port}${ServiceOptions.graphQLEndpoint}`));
}