const ApolloClient = require("apollo-client").ApolloClient;
const createNetworkInterface = require("apollo-client").createNetworkInterface;
const gql = require("graphql-tag");

require("isomorphic-fetch");

const debug = require("debug")("ndb:swc-api:transform-client");

import {TransformServiceOptions} from "../options/serviceOptions";

export class TransformApiClient {
    private _client: any;

    constructor() {
        const url = `http://${TransformServiceOptions.host}:${TransformServiceOptions.port}/graphql`;

        debug(`creating apollo client for transform service ${url}`);
        const networkInterface = createNetworkInterface({uri: url});

        this._client = new ApolloClient({
            networkInterface: networkInterface,
        });
    }

    queryTracing(id) {
        return this._client.query({
            query: gql`
                query($id: String!) {
                  tracings(queryInput: {swcTracingIds: [$id]}) {
                    tracings {
                      id
                      nodeCount
                      transformStatus {
                        startedAt
                      }
                      swcTracing {
                        id
                      }
                      transformedAt
                    }
                  }
                }`,
            variables: {
                id: id
            },
            fetchPolicy: "network-only"
        });
    }

    transformTracing(id: string) {
        return this._client.mutate({
            mutation: gql`
                mutation applyTransform($id: String!) {
                    applyTransform(swcId: $id) {
                        tracing {
                            id
                        }
                        errors
                    }
                }`,
            variables: {
                id: id
            }
        });
    }

    deleteTracingsForSwc(ids: string[]) {
        return this._client.mutate({
            mutation: gql`
                mutation DeleteTracingsForSwc($swcTracingIds: [String!]) {
                    deleteTracingsForSwc(swcTracingIds: $swcTracingIds) {
                        error {
                            name
                            message
                        }
                    }
                }`,
            variables: {
                swcTracingIds: ids
            }
        });
    }
}

export const transformClient = new TransformApiClient();
