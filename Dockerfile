FROM denoland/deno:2.9.7 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json deno.json deno.lock ./
RUN deno install --frozen-lockfile
COPY . .
RUN deno task build

FROM denoland/deno:2.9.7
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=deno:deno /app/deno.json ./
COPY --from=build --chown=deno:deno /app/.next/standalone ./
COPY --from=build --chown=deno:deno /app/.next/static ./.next/static
USER deno
EXPOSE 3000
CMD ["deno", "run", "--allow-all", "server.js"]
