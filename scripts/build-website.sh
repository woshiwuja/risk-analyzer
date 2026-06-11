#!/bin/bash

# Fast build of the static website only (library + webapp), same steps as the Dockerfile.
# Output: packages/threat-composer-app/build/website/

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="${REPO_ROOT}/node_modules/.bin:${PATH}"

cd "${REPO_ROOT}/packages/threat-composer"
tsc --build
cd src
find . \( -name '*.css' -o -name '*.png' -o -name '*.gif' \) -exec cp --parents {} ../lib/ \;

cd "${REPO_ROOT}/packages/threat-composer-app"
NODE_OPTIONS=--max-old-space-size=8192 GENERATE_SOURCEMAP=false BUILD_PATH=./build/website/ craco build
