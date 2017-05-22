export = {
    "sample": {
        "development": {
            "database": "samples_development",
            "host": "localhost",
            "port": "5432",
            "dialect": "postgres",
            "logging": null
        },
        "test": {
            "database": "samples_test",
            "host": "sample-db",
            "port": "5432",
            "dialect": "postgres",
            "logging": null
        },
        azure: {
            database: "jrcndb",
            host: "janeliandb.database.windows.net",
            dialect: "mssql",
            dialectOptions: {
                encrypt: true
            },
            logging: null
        },
        "production": {
            "database": "samples_production",
            "host": "sample-db",
            "port": "5432",
            "dialect": "postgres",
            "logging": null
        }
    },
    "swc": {
        "development": {
            "database": "swc_development",
            "host": "localhost",
            "port": "5433",
            "dialect": "postgres",
            "logging": null
        },
        "test": {
            "database": "swc_test",
            "host": "swc-db",
            "port": "5432",
            "dialect": "postgres",
            "logging": null
        },
        azure: {
            database: "jrcndb",
            host: "janeliandb.database.windows.net",
            dialect: "mssql",
            dialectOptions: {
                encrypt: true
            },
            logging: null
        },
        "production": {
            "database": "swc_production",
            "host": "swc-db",
            "port": "5432",
            "dialect": "postgres",
            "logging": null
        }
    }
}

