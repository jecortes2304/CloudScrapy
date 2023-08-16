#!/bin/bash

echo "${0}: INSTALLING DEPENDENCIES"
npm install

echo "${0}: UPDATING DOCUMENTATION"
npm run swagger

echo "${0}: INITIATING SERVER"
npm run start

exec "$@"