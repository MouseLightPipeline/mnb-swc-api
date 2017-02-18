#!/usr/bin/env bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE swc_development;
    GRANT ALL PRIVILEGES ON DATABASE swc_development TO "$POSTGRES_USER";
    CREATE DATABASE swc_test;
    GRANT ALL PRIVILEGES ON DATABASE swc_test TO "$POSTGRES_USER";
    CREATE DATABASE swc_production;
    GRANT ALL PRIVILEGES ON DATABASE swc_production TO "$POSTGRES_USER";
EOSQL
