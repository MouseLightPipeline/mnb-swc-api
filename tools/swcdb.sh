#!/bin/bash

# First argument is location of the swc-datastore directory.  Not required if running from the root ndb directory.

if [ $# -eq 0 ]; then
    SRCDIR=$(PWD)
else
    SRCDIR=$1
fi

echo $SRCDIR

docker inspect swc-datastore

if [ $? -ne 0 ]; then
  docker create --name swc-datastore postgres
fi

docker inspect swc-db

if [ $? -ne 0 ]; then
    echo "Running new swc-db container"
    docker run -v $SRCDIR/swc-datastore:/docker-entrypoint-initdb.d --volumes-from swc-datastore -e POSTGRES_PASSWORD=pgsecret -p 5433:5432 -i --name swc-db postgres
else
    echo "Starting existing swc-db container"
    docker start swc-db -ai
fi

