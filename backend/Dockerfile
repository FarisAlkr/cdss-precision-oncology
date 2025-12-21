FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Train model on startup if it doesn't exist
CMD ["sh", "-c", "if [ ! -f app/ml/model.json ]; then python app/ml/train_model.py; fi && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
