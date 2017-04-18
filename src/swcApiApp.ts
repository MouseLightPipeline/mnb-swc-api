import * as express from "express";
import * as bodyParser from "body-parser";
import * as multer from "multer";

const debug = require("debug")("ndb:swc-api:server");

import {serverConfiguration} from "./config/server.config";

import {graphQLMiddleware, graphiQLMiddleware} from "./graphql/middleware/graphQLMiddleware";

const PORT = process.env.API_PORT || serverConfiguration.port;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(multer({dest: "uploads"}).any());

app.use(serverConfiguration.graphQlEndpoint, graphQLMiddleware());

app.use(["/", serverConfiguration.graphiQlEndpoint], graphiQLMiddleware(serverConfiguration));

app.listen(PORT, () => debug(`swc api server is now running on http://localhost:${PORT}`));
