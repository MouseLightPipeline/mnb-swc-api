const configuration = {
    port: 9651,
    graphQLEndpoint: "/graphql",
    graphiQLEndpoint: "/graphiql"
};

function loadConfiguration() {
    const c = Object.assign({}, configuration);

    c.port = parseInt(process.env.SWC_API_PORT) || c.port;
    c.graphQLEndpoint = process.env.SWC_API_ENDPOINT || process.env.CORE_SERVICES_ENDPOINT || c.graphQLEndpoint;

    return c;
}

export const ServiceOptions = loadConfiguration();
