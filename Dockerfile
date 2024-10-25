# Use Python slim image for a smaller footprint
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy the entire application
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the server
CMD ["python", "server.py"]
