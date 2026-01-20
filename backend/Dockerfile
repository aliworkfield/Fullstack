FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1

# Install necessary packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for OpenShift compatibility
RUN useradd -u 1001 -m -s /bin/bash appuser

WORKDIR /app/

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV PYTHONPATH=/app

# Copy all project files
COPY ./pyproject.toml ./uv.lock /app/
COPY ./app /app/app
COPY ./scripts /app/scripts
COPY ./alembic.ini /app/

# Create virtual environment and install dependencies
RUN uv venv /app/.venv && \
    uv pip install --no-cache -r pyproject.toml

# Make scripts executable
RUN chmod +x /app/scripts/*.sh

# Set ownership for OpenShift (group 0 with same permissions as owner)
RUN chown -R 1001:0 /app && chmod -R g=u /app

USER 1001

EXPOSE 8000

# Copy and set entrypoint script
COPY --chown=1001:0 ./scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
