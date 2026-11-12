# Akines web app (Next.js, standalone output). Runs `node server.js` on port 3100.
#   docker build -t akines-web --build-arg NEXT_PUBLIC_AKINES_LIVE_URL=wss://api.akines.com/ws/v1/live \
#     --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-abc123.apps.googleusercontent.com .
# Runtime environment: AKINES_API_URL=http://web-api:8000/api/v1 (internal address of the API; server side only).
# NEXT_PUBLIC_* values are baked in at build time, so each environment (staging, production) has its own image.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_AKINES_LIVE_URL
# Continue with Google: the Web client ID from Google Cloud Console (not secret). Empty: Google sign-in is off.
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
# production: refuses demo mode and a non-wss live address (next.config.ts). Preview images may pass "preview".
ARG AKINES_ENV=production
ENV NEXT_PUBLIC_AKINES_LIVE_URL=$NEXT_PUBLIC_AKINES_LIVE_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    AKINES_ENV=$AKINES_ENV \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `yarn build` first runs scripts/images.mjs (package.json prebuild): every photo under public/ is resized into
# public/_img (AVIF/WebP/JPEG, hashed names), which the run stage copies with the rest of public/.
RUN yarn build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3100 \
    HOSTNAME=0.0.0.0
RUN addgroup -S akines && adduser -S akines -G akines
COPY --from=build --chown=akines:akines /app/.next/standalone ./
COPY --from=build --chown=akines:akines /app/.next/static ./.next/static
COPY --from=build --chown=akines:akines /app/public ./public
USER akines
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3100/landing').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
