# Use Python 3.11 (The version that works!)
FROM python:3.11

# Set up the folder
WORKDIR /app

# Copy files
COPY requirements.txt .
# Install libraries (and upgrade pip to be safe)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code (including the .keras model)
COPY . .

# Create a writable directory for TensorFlow to use (Fixes permission errors)
RUN mkdir -p /tmp/tf_cache
ENV TFHUB_CACHE_DIR=/tmp/tf_cache
ENV MPLCONFIGDIR=/tmp/tf_cache

# Start the server on port 7860 (Hugging Face specific port)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]