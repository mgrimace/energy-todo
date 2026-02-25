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
FROM debian:bookworm-slim
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& groupadd --system app \
	&& useradd --system --create-home --gid app --uid 10001 app
WORKDIR /app
# Copy the backend binary
COPY --from=backend-builder /app/backend/target/release/energy_todo_backend ./energy_todo_backend
# Copy the built frontend into /app/dist
COPY --from=frontend-builder /app/frontend/dist ./dist
# create runtime data directory; actual todos.json should be mounted by compose/host
RUN mkdir -p /app/data && chown -R app:app /app
VOLUME ["/app/data"]
EXPOSE 3000
ENV RUST_LOG=info
USER app:app
CMD ["./energy_todo_backend"]
