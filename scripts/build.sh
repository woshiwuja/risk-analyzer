#!/bin/bash

set -e

# Use the locally installed pdk (node_modules/.bin) so no global install is required
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="${REPO_ROOT}/node_modules/.bin:${PATH}"

# pdk shells out to yarn: bootstrap a local yarn if none is on the PATH
if ! command -v yarn >/dev/null 2>&1; then
  mkdir -p "${REPO_ROOT}/node_modules/.bin"
  if command -v corepack >/dev/null 2>&1; then
    corepack enable --install-directory "${REPO_ROOT}/node_modules/.bin" yarn
  else
    printf '#!/bin/bash\nexec npx -y yarn@1.22.22 "$@"\n' > "${REPO_ROOT}/node_modules/.bin/yarn"
    chmod +x "${REPO_ROOT}/node_modules/.bin/yarn"
  fi
fi

cd "${REPO_ROOT}"
pdk install --frozen-lockfile
pdk build
pdk workspaces run eslint
