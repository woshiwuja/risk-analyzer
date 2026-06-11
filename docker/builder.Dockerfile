# Containerized build environment: all JS tooling (node, yarn, pdk) lives here,
# nothing needs to be installed on the host.
FROM public.ecr.aws/docker/library/node:20

# Trust corporate TLS-inspection CAs (e.g. Zscaler)
COPY docker/certs/ /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

RUN npm install -g @aws/pdk

WORKDIR /app
CMD ["./scripts/build.sh"]
