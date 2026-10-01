# syntax=docker/dockerfile:1.7

# Stage 1 — build the React frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --silent --no-audit --no-fund
COPY frontend/vite.config.js frontend/index.html ./
COPY frontend/public ./public
COPY frontend/src ./src
RUN npm run build

# Stage 2 — prepare Rust dependency recipe
FROM rust:1.88-slim AS chef
RUN cargo install cargo-chef --locked
WORKDIR /app/backend
COPY backend/Cargo.toml ./
COPY backend/Cargo.lock ./
COPY backend/src ./src
RUN cargo chef prepare --recipe-path recipe.json

# Stage 3 — build Rust backend using cached dependencies
FROM rust:1.88-slim AS backend-builder
COPY --from=chef /usr/local/cargo/bin/cargo-chef /usr/local/cargo/bin/cargo-chef
WORKDIR /app/backend
COPY --from=chef /app/backend/recipe.json recipe.json
COPY backend/Cargo.toml ./
COPY backend/Cargo.lock ./
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	--mount=type=cache,target=/app/backend/target \
	cargo chef cook --release --locked --recipe-path recipe.json
COPY backend/src ./src
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	cargo build --release --locked && \
	strip target/release/energy_todo_backend

# Stage 4 — minimal runtime image
FROM debian:trixie-slim
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates gosu \
	&& rm -rf /var/lib/apt/lists/* \
	&& groupadd --system app \
	&& useradd --system --create-home --gid app --uid 10001 app
WORKDIR /app
COPY --from=backend-builder /app/backend/target/release/energy_todo_backend ./energy_todo_backend
COPY --from=frontend-builder /app/frontend/dist ./dist
COPY backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN mkdir -p /app/data \
	&& chmod +x /usr/local/bin/entrypoint.sh \
	&& chmod -R a+rX /app \
	&& chown -R app:app /app/data
VOLUME ["/app/data"]
EXPOSE 3000
ENV RUST_LOG=info
# No USER line: the entrypoint drops privileges after fixing /app/data
ENTRYPOINT ["entrypoint.sh"]
CMD ["./energy_todo_backend"]