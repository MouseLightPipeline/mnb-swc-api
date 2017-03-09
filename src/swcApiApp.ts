import * as express from "express";
import * as bodyParser from "body-parser";
import * as multer from "multer";

const debug = require("debug")("ndb:swc-api:server");

import serverConfiguration from "./config/server.config";

import {graphQLMiddleware, graphiQLMiddleware} from "./graphql/middleware/graphQLMiddleware";

const config = serverConfiguration();

const PORT = process.env.API_PORT || config.port;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(multer({dest: "uploads"}).any());

app.use(config.graphQlEndpoint, graphQLMiddleware());

app.use(config.graphiQlEndpoint, graphiQLMiddleware(config));

app.listen(PORT, () => debug(`swc api server is now running on http://localhost:${PORT}`));
