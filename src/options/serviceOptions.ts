const configuration = {
    port: 5000,
    graphQLEndpoint: "/graphql"
};

function loadConfiguration() {
    const c = Object.assign({}, configuration);

    c.port = parseInt(process.env.SWC_API_PORT) || c.port;
    c.graphQLEndpoint = process.env.SWC_API_ENDPOINT || process.env.CORE_SERVICES_ENDPOINT || c.graphQLEndpoint;

    return c;
}

export const ServiceOptions = loadConfiguration();
