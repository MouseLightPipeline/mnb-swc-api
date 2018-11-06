import { HttpLink } from "apollo-link-http";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";

require("isomorphic-fetch");

const debug = require("debug")("mnb:swc-api:transform-client");

import {TransformServiceOptions} from "../options/coreServicesOptions";

export class TransformApiClient {
    private _client: any;

    constructor() {
        const url = `http://${TransformServiceOptions.host}:${TransformServiceOptions.port}/${TransformServiceOptions.graphQLEndpoint}`;

        debug(`creating apollo client for transform service ${url}`);

        this._client = new ApolloClient({
            link: new HttpLink({uri: url}),
            cache: new InMemoryCache()
        });
    }

    public queryTracings(ids: string[]) {
        return this._client.query({
            query: gql`
                query($ids: [String!]) {
                  tracings(queryInput: {swcTracingIds: $ids}) {
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
                ids: ids
            },
            fetchPolicy: "network-only"
        });
    }

    public transformTracing(id: string) {
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

    public deleteTracingsForSwc(ids: string[]) {
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
