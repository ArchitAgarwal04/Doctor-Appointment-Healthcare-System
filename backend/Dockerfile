# ── Stage 1: Base image ──────────────────────────────────────────────
# Use official slim Python image to keep the image small
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ── Stage 2: Install dependencies ────────────────────────────────────
# Copy only requirements first (leverages Docker layer cache)
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 3: Copy source code ─────────────────────────────────────────
COPY . .

# ── Stage 4: Expose port & run ────────────────────────────────────────
# FastAPI runs on port 8000 by default
EXPOSE 8000

# Start the FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
