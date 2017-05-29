import * as express from "express";
import * as bodyParser from "body-parser";
import * as multer from "multer";

const debug = require("debug")("ndb:swc-api:server");

import {ServiceOptions} from "./options/serviceOptions";

import {graphQLMiddleware, graphiQLMiddleware} from "./graphql/middleware/graphQLMiddleware";

const PORT = process.env.API_PORT || ServiceOptions.serverOptions.port;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(multer({dest: "uploads"}).any());

app.use(ServiceOptions.serverOptions.graphQlEndpoint, graphQLMiddleware());

app.use(["/", ServiceOptions.serverOptions.graphiQlEndpoint], graphiQLMiddleware(ServiceOptions));

app.listen(PORT, () => debug(`swc api server is now running on http://localhost:${PORT}`));
