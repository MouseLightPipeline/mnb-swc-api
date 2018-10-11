import * as express from "express";
import * as os from "os";
import {ApolloServer} from "apollo-server-express";

const debug = require("debug")("mnb:swc-api:server");

import {ServiceOptions} from "./options/serviceOptions";
import typeDefinitions from "./graphql/typeDefinitions";
import resolvers from "./graphql/serverResolvers";
import {GraphQLServerContext} from "./graphql/serverContext";

const app = express();

const server = new ApolloServer({typeDefs: typeDefinitions, resolvers, context: () => new GraphQLServerContext()});

server.applyMiddleware({app, path: ServiceOptions.graphQLEndpoint});

app.listen(ServiceOptions.port, () => debug(`swc api server is now running on http://${os.hostname()}:${ServiceOptions.port}`));
