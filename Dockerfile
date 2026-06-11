# Stage 1: build the static website
FROM public.ecr.aws/docker/library/node:20 AS build

# Trust corporate TLS-inspection CAs (e.g. Zscaler) so yarn/node work behind such proxies
COPY docker/certs/ /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

WORKDIR /app

# Install dependencies first to leverage docker layer caching
COPY package.json yarn.lock ./
COPY packages/threat-composer/package.json packages/threat-composer/
COPY packages/threat-composer-app/package.json packages/threat-composer-app/
COPY packages/threat-composer-app-browser-extension/package.json packages/threat-composer-app-browser-extension/
COPY packages/threat-composer-infra/package.json packages/threat-composer-infra/
RUN yarn install --frozen-lockfile --ignore-engines --ignore-scripts

COPY . .

# Build the threat-composer library (tsc + static assets used by the app)
RUN cd packages/threat-composer \
    && npx tsc --build \
    && cd src \
    && find . \( -name '*.css' -o -name '*.png' -o -name '*.gif' \) -exec cp --parents {} ../lib/ \;

# Build the static website
RUN cd packages/threat-composer-app \
    && NODE_OPTIONS=--max-old-space-size=8192 GENERATE_SOURCEMAP=false BUILD_PATH=./build/website/ npx craco build

# Stage 2: serve the static build with python http.server (with SPA fallback to index.html)
FROM public.ecr.aws/docker/library/python:3.12-slim

WORKDIR /site
COPY --from=build /app/packages/threat-composer-app/build/website/ /site/
COPY docker/serve.py /serve.py

EXPOSE 3000
CMD ["python", "/serve.py"]
