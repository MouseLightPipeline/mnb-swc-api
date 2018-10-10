import * as express from "express";
import * as os from "os";
import * as bodyParser from "body-parser";
import * as multer from "multer";

const debug = require("debug")("mnb:swc-api:server");

import {ServiceOptions} from "./options/serviceOptions";

import {graphQLMiddleware, graphiQLMiddleware} from "./graphql/middleware/graphQLMiddleware";

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(multer({dest: "uploads"}).any());

app.use(ServiceOptions.graphQLEndpoint, graphQLMiddleware());

app.use(["/", ServiceOptions.graphQLEndpoint], graphiQLMiddleware(ServiceOptions));

app.listen(ServiceOptions.port, () => debug(`swc api server is now running on http://${os.hostname()}:${ServiceOptions.port}`));
