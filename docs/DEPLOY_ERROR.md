#11 [deps 6/6] RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts
#11 0.199 warn: This version of pnpm requires at least Node.js v22.13
#11 0.199 warn: The current version of Node.js is v20.20.2
#11 0.199 warn: Visit https://r.pnpm.io/comp to see the list of past pnpm versions with respective Node.js version support.
#11 0.547 node:internal/modules/cjs/loader:1031
#11 0.547       throw new ERR_UNKNOWN_BUILTIN_MODULE(request);
#11 0.547             ^
#11 0.547
#11 0.547 Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite
#11 0.547     at Module._load (node:internal/modules/cjs/loader:1031:13)
#11 0.547     at Module.require (node:internal/modules/cjs/loader:1289:19)
#11 0.547     at require (node:internal/modules/helpers:182:18)
#11 0.547     at ../store/index/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:16070:25)
#11 0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
#11 0.547     at ../resolving/npm-resolver/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:26969:5)
#11 0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
#11 0.547     at ../workspace/projects-graph/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:27115:5)
#11 0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
#11 0.547     at ../workspace/projects-filter/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:43018:5) {
#11 0.547   code: 'ERR_UNKNOWN_BUILTIN_MODULE'
#11 0.547 }
#11 0.547
#11 0.547 Node.js v20.20.2
#11 ERROR: process "/bin/sh -c pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts" did not complete successfully: exit code: 1
------
> [deps 6/6] RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts:
0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
0.547     at ../resolving/npm-resolver/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:26969:5)
0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
0.547     at ../workspace/projects-graph/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:27115:5)
0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
0.547     at ../workspace/projects-filter/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:43018:5) {
0.547   code: 'ERR_UNKNOWN_BUILTIN_MODULE'
0.547 }
0.547
0.547 Node.js v20.20.2
------
Dockerfile:20
--------------------
18 |     COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
19 |     COPY prisma ./prisma
20 | >>> RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts
21 |
22 |     # Stage 2: Build
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts" did not complete successfully: exit code: 1
exit status 1
Oops something is not okay, are you okay? 😢
#0 building with "default" instance using docker driver
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 4.49kB done
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 DONE 0.4s
#3 [internal] load .dockerignore
#3 transferring context: 191B done
#3 DONE 0.0s
#4 [deps 1/6] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 CACHED
#5 [internal] load build context
#5 transferring context: 18.78MB 0.2s done
#5 DONE 0.2s
#6 [deps 2/6] RUN corepack enable && corepack prepare pnpm@latest --activate
#6 0.672 Preparing pnpm@latest for immediate activation...
#6 DONE 1.5s
#7 [deps 3/6] WORKDIR /app
#7 DONE 0.0s
#8 [deps 4/6] COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
#8 DONE 0.0s
#9 [deps 5/6] COPY prisma ./prisma
#9 DONE 0.0s
#10 [runner  4/18] RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nextjs
#10 DONE 0.1s
#11 [deps 6/6] RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts
#11 0.199 warn: This version of pnpm requires at least Node.js v22.13
#11 0.199 warn: The current version of Node.js is v20.20.2
#11 0.199 warn: Visit https://r.pnpm.io/comp to see the list of past pnpm versions with respective Node.js version support.
#11 0.547 node:internal/modules/cjs/loader:1031
#11 0.547       throw new ERR_UNKNOWN_BUILTIN_MODULE(request);
#11 0.547             ^
#11 0.547
#11 0.547 Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite
#11 0.547     at Module._load (node:internal/modules/cjs/loader:1031:13)
#11 0.547     at Module.require (node:internal/modules/cjs/loader:1289:19)
#11 0.547     at require (node:internal/modules/helpers:182:18)
#11 0.547     at ../store/index/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:16070:25)
#11 0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
#11 0.547     at ../resolving/npm-resolver/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:26969:5)
#11 0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
#11 0.547     at ../workspace/projects-graph/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:27115:5)
#11 0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
#11 0.547     at ../workspace/projects-filter/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:43018:5) {
#11 0.547   code: 'ERR_UNKNOWN_BUILTIN_MODULE'
#11 0.547 }
#11 0.547
#11 0.547 Node.js v20.20.2
#11 ERROR: process "/bin/sh -c pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts" did not complete successfully: exit code: 1
------
> [deps 6/6] RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts:
0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
0.547     at ../resolving/npm-resolver/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:26969:5)
0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
0.547     at ../workspace/projects-graph/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:27115:5)
0.547     at __init (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:15:56)
0.547     at ../workspace/projects-filter/lib/index.js (file:///root/.cache/node/corepack/v1/pnpm/11.1.2/dist/pnpm.mjs:43018:5) {
0.547   code: 'ERR_UNKNOWN_BUILTIN_MODULE'
0.547 }
0.547
0.547 Node.js v20.20.2
------
Dockerfile:20
--------------------
18 |     COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
19 |     COPY prisma ./prisma
20 | >>> RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts
21 |
22 |     # Stage 2: Build
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts" did not complete successfully: exit code: 1
exit status 1
Deployment failed. Removing the new version of your application.
Gracefully shutting down build container: vcckko4s8cg8ggk4ks4cw48c
[CMD]: docker stop --time=30 vcckko4s8cg8ggk4ks4cw48c
vcckko4s8cg8ggk4ks4cw48c
[CMD]: docker rm -f vcckko4s8cg8ggk4ks4cw48c
Error response from daemon: No such container: vcckko4s8cg8ggk4ks4cw48c